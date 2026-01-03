// API Types - Request and Response interfaces for all API endpoints
// These types ensure type safety between frontend and backend

// ============================================
// Auth Service Types
// ============================================

/**
 * Request body for user registration
 */
export interface RegisterRequest {
  name: string;
  password: string;
}

/**
 * Request body for user login
 */
export interface LoginRequest {
  name: string;
  password: string;
}

/**
 * Response from successful authentication (login/register)
 */
export interface AuthResponse {
  token: string;
  expiresAt: string;
  role: UserRole;
}

/**
 * User roles in the system
 */
export type UserRole = 'Admin' | 'Member';

// ============================================
// Resource Service Types
// ============================================

/**
 * Request body for creating a new asset
 */
export interface CreateAssetRequest {
  name: string;
  type: string;
  status: string;
}

/**
 * Response for asset data
 */
export interface AssetResponse {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

// ============================================
// Error Types
// ============================================

/**
 * Standard ProblemDetails error response from API
 */
export interface ProblemDetails {
  title: string;
  detail: string;
  status: number;
  errors?: Record<string, string[]>;
}

/**
 * API error wrapper for consistent error handling
 */
export interface ApiError {
  message: string;
  status: number;
  details?: ProblemDetails;
}
