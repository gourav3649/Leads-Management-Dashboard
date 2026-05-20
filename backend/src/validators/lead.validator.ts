import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { LEAD_STATUSES } from '../constants/lead-status.js';
import { LEAD_SOURCES } from '../constants/lead-source.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCreateLead = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, status, source, phone, company } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('Please provide a valid email address');
  }

  if (status && !LEAD_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${LEAD_STATUSES.join(', ')}`);
  }

  if (!source || !LEAD_SOURCES.includes(source)) {
    errors.push(`Source must be one of: ${LEAD_SOURCES.join(', ')}`);
  }

  if (phone !== undefined && typeof phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (company !== undefined && typeof company !== 'string') {
    errors.push('Company must be a string');
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  next();
};

export const validateUpdateLead = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, status, source, phone, company } = req.body;
  const errors: string[] = [];

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    errors.push('Name must be at least 2 characters long');
  }

  if (email !== undefined && (typeof email !== 'string' || !emailRegex.test(email.trim()))) {
    errors.push('Please provide a valid email address');
  }

  if (status !== undefined && !LEAD_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${LEAD_STATUSES.join(', ')}`);
  }

  if (source !== undefined && !LEAD_SOURCES.includes(source)) {
    errors.push(`Source must be one of: ${LEAD_SOURCES.join(', ')}`);
  }

  if (phone !== undefined && typeof phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (company !== undefined && typeof company !== 'string') {
    errors.push('Company must be a string');
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  next();
};
