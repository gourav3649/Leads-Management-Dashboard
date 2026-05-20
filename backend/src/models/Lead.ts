import mongoose from 'mongoose';
import { LEAD_STATUSES } from '../constants/lead-status.js';
import { LEAD_SOURCES } from '../constants/lead-source.js';
import type { LeadStatus } from '../constants/lead-status.js';
import type { LeadSource } from '../constants/lead-source.js';

interface ILeadDocument extends mongoose.Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new mongoose.Schema<ILeadDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    status: { type: String, enum: LEAD_STATUSES, default: 'New' },
    source: { type: String, enum: LEAD_SOURCES, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes for better query performance
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ createdBy: 1 });
leadSchema.index({ createdBy: 1, createdAt: -1 });

export const Lead = mongoose.model<ILeadDocument>('Lead', leadSchema);
