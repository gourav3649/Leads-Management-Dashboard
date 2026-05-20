import type { ILead } from '../types/lead.types.js';

export const generateCsvFromLeads = (leads: ILead[]): string => {
  const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Created At'];
  const rows = leads.map((lead) => [
    `"${lead.name.replace(/"/g, '""')}"`,
    `"${lead.email}"`,
    `"${(lead.phone || '').replace(/"/g, '""')}"`,
    `"${(lead.company || '').replace(/"/g, '""')}"`,
    lead.status,
    lead.source,
    new Date(lead.createdAt).toISOString().split('T')[0],
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join(
    '\n'
  );

  return csvContent;
};
