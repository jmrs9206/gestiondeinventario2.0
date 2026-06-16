import { apiFetch } from '@/services/api-client';

export interface OfficeCount {
  publicId: string;
  name: string;
  count: number;
}

export interface DashboardKpis {
  totalMaterials: number;
  statusCounts: Record<string, number>;
  officeCounts: OfficeCount[];
  incidencesCount: number;
  meanRepairTimeInHours: number;
  completeWorkstations: number;
  partialWorkstations: number;
  specialWorkstations: number;
}

export interface MaterialHistoryResponse {
  id: number;
  materialPublicCode: string;
  action: string;
  previousStatus: string | null;
  newStatus: string | null;
  previousOfficePublicId: string | null;
  previousOfficeName: string | null;
  newOfficePublicId: string | null;
  newOfficeName: string | null;
  comment: string | null;
  performedByUserEmail: string | null;
  performedByUserFullName: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export async function fetchDashboardKpis(signal?: AbortSignal): Promise<DashboardKpis> {
  return apiFetch<DashboardKpis>('/api/v1/dashboard/kpis', { signal });
}

export async function fetchRecentMovements(limit: number = 10, signal?: AbortSignal): Promise<PaginatedResponse<MaterialHistoryResponse>> {
  return apiFetch<PaginatedResponse<MaterialHistoryResponse>>(`/api/v1/inventory/history?size=${limit}`, { signal });
}
