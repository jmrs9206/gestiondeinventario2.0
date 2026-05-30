import { apiFetch } from '@/services/api-client';
import { PaginatedResponse } from './material.service';

export interface AuditLogResponse {
  entityType: string;
  entityId: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  performedByType: string;
  performedById: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export async function fetchAuditLogs(page: number = 0, size: number = 20): Promise<PaginatedResponse<AuditLogResponse>> {
  return apiFetch<PaginatedResponse<AuditLogResponse>>(`/api/v1/audit?page=${page}&size=${size}&sort=createdAt,desc`);
}
