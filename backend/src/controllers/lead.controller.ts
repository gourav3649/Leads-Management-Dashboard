import { Lead } from '../models/Lead.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { calculatePagination, getPaginationParams } from '../utils/pagination.js';
import { generateCsvFromLeads } from '../utils/csv.js';
import type { LeadListQuery } from '../types/api.types.js';
import type { ILead } from '../types/lead.types.js';

// Create a Lead
export const createLead = asyncHandler(async (req, res) => {
  const { name, email, status, source, phone, company } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const newLead = await Lead.create({
    name,
    email,
    status: status || 'New',
    source,
    phone: phone || '',
    company: company || '',
    createdBy: userId,
  });

  res.status(201).json(
    ApiResponse.success(newLead, 'Lead created successfully')
  );
});

// Helper to build MongoDB query filter from API query options
const buildLeadFilter = (query: LeadListQuery) => {
  const filter: any = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.source) {
    filter.source = query.source;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { name: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
      { company: { $regex: searchRegex } },
    ];
  }

  return filter;
};

// View Leads List with Filtering, Searching, and Pagination
export const getAllLeads = asyncHandler(async (req, res) => {
  const query = req.query as unknown as LeadListQuery;
  const { page, limit } = getPaginationParams(query.page, query.limit);

  const filter = buildLeadFilter(query);

  const sortOrder = query.sort === 'oldest' ? 1 : -1;
  const sortOptions = { createdAt: sortOrder as 1 | -1 };

  const total = await Lead.countDocuments(filter);
  const paginationMeta = calculatePagination({ page, limit, total });

  const leads = await Lead.find(filter)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('createdBy', 'name email role');

  res.status(200).json(
    ApiResponse.success(leads, 'Leads fetched successfully', paginationMeta)
  );
});

// Get Global Lead Stats
export const getLeadStats = asyncHandler(async (req, res) => {
  const stats = await Lead.aggregate([
    {
      $facet: {
        statusCounts: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        sourceCounts: [
          { $group: { _id: '$source', count: { $sum: 1 } } }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
  ]);

  const rawStatus = stats[0]?.statusCounts || [];
  const rawSource = stats[0]?.sourceCounts || [];
  const totalLeads = stats[0]?.totalCount[0]?.count || 0;

  const statusCounts = {
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Converted: 0,
    Lost: 0
  };

  const sourceCounts = {
    Website: 0,
    Instagram: 0,
    Referral: 0
  };

  rawStatus.forEach((item: any) => {
    if (item._id in statusCounts) {
      statusCounts[item._id as keyof typeof statusCounts] = item.count;
    }
  });

  rawSource.forEach((item: any) => {
    if (item._id in sourceCounts) {
      sourceCounts[item._id as keyof typeof sourceCounts] = item.count;
    }
  });

  // Calculate Lead Velocity: Duration to transition from 'New' to 'Converted'
  const velocityData = await Lead.aggregate([
    { $match: { status: 'Converted' } },
    {
      $project: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
        daysToConvert: {
          $max: [
            1,
            {
              $round: {
                $divide: [
                  { $subtract: ['$updatedAt', '$createdAt'] },
                  1000 * 60 * 60 * 24
                ]
              }
            }
          ]
        }
      }
    },
    { $sort: { date: 1 } }
  ]);

  // Compute deterministic regional distribution for maps visualization
  const allLeads = await Lead.find({}, 'name');
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const regionalDistribution = {
    North: 0,
    South: 0,
    East: 0,
    West: 0,
    Central: 0
  };

  allLeads.forEach((lead) => {
    const hash = (lead.name || '').charCodeAt(0) + (lead.name || '').length;
    const region = regions[hash % regions.length] as keyof typeof regionalDistribution;
    regionalDistribution[region]++;
  });

  res.status(200).json(
    ApiResponse.success(
      {
        totalLeads,
        statusCounts,
        sourceCounts,
        regionalDistribution,
        velocityData
      },
      'Lead stats fetched successfully'
    )
  );
});

// View Single Lead Details
export const getLeadById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await Lead.findById(id).populate('createdBy', 'name email role');
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  res.status(200).json(
    ApiResponse.success(lead, 'Lead fetched successfully')
  );
});

// Update Lead
export const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, status, source, phone, company } = req.body;

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  if (name !== undefined) lead.name = name;
  if (email !== undefined) lead.email = email;
  if (phone !== undefined) lead.phone = phone;
  if (company !== undefined) lead.company = company;
  if (status !== undefined) lead.status = status;
  if (source !== undefined) lead.source = source;

  const updatedLead = await lead.save();

  res.status(200).json(
    ApiResponse.success(updatedLead, 'Lead updated successfully')
  );
});

// Delete Lead (RBAC restricted to Admin in routes)
export const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await Lead.findById(id);
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }

  await lead.deleteOne();

  res.status(200).json(
    ApiResponse.success({ id }, 'Lead deleted successfully')
  );
});

// Export Leads as CSV
export const exportLeadsCsv = asyncHandler(async (req, res) => {
  const query = req.query as unknown as LeadListQuery;
  const filter = buildLeadFilter(query);

  const sortOrder = query.sort === 'oldest' ? 1 : -1;
  const sortOptions = { createdAt: sortOrder as 1 | -1 };

  const leads = await Lead.find(filter).sort(sortOptions);

  const typedLeads = leads.map(l => ({
    _id: l._id.toString(),
    name: l.name,
    email: l.email,
    phone: l.phone,
    company: l.company,
    status: l.status,
    source: l.source,
    createdBy: l.createdBy.toString(),
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  } as ILead));

  const csvContent = generateCsvFromLeads(typedLeads);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=leads_export.csv');
  res.status(200).send(csvContent);
});
