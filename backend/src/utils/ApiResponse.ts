import type { SuccessResponse, PaginationMeta } from '../types/api.types.js';

export class ApiResponse {
  static success<T>(
    data: T,
    message: string = 'Success',
    pagination?: PaginationMeta
  ): SuccessResponse<T> {
    return {
      success: true,
      message,
      data,
      ...(pagination && { pagination }),
    };
  }
}
