import type { UserRole } from '../constants/roles.js';
import type { LeadStatus } from '../constants/lead-status.js';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: SafeUser;
}

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
