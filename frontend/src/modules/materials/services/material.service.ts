import { apiFetch, authenticatedFetch } from '@/services/api-client';

export interface MaterialResponse {
  publicCode: string;
  materialType: string;
  brand: string;
  model: string;
  serialNumber: string;
  description: string | null;
  status: string; // OPERATIVO, EN_REPARACION, ROTO, BAJA
  officePublicId: string | null;
  officeName: string | null;
  purchasePrice?: number;
  purchaseDate?: string;
  createdByName: string | null;
  updatedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialRequest {
  materialType: string;
  brand: string;
  model: string;
  serialNumber: string;
  description: string | null;
  status: string;
  officePublicId: string | null;
  purchasePrice?: number;
  purchaseDate?: string;
  comment: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
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

export interface FetchMaterialsParams {
  status?: string;
  materialType?: string;
  officePublicId?: string;
  serialNumber?: string;
  includeInactive?: boolean;
  page?: number;
  size?: number;
}

export async function fetchMaterials(params: FetchMaterialsParams = {}): Promise<PaginatedResponse<MaterialResponse>> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.append('status', params.status);
  if (params.materialType) searchParams.append('materialType', params.materialType);
  if (params.officePublicId) searchParams.append('officePublicId', params.officePublicId);
  if (params.serialNumber) searchParams.append('serialNumber', params.serialNumber);
  if (params.includeInactive !== undefined) searchParams.append('includeInactive', params.includeInactive.toString());
  if (params.page !== undefined) searchParams.append('page', params.page.toString());
  if (params.size !== undefined) searchParams.append('size', params.size.toString());

  const query = searchParams.toString();
  return apiFetch<PaginatedResponse<MaterialResponse>>(`/api/v1/materials${query ? `?${query}` : ''}`);
}

export async function fetchMaterial(publicCode: string): Promise<MaterialResponse> {
  return apiFetch<MaterialResponse>(`/api/v1/materials/${publicCode}`);
}

export async function createMaterial(data: MaterialRequest): Promise<MaterialResponse> {
  return apiFetch<MaterialResponse>('/api/v1/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMaterial(publicCode: string, data: MaterialRequest): Promise<MaterialResponse> {
  return apiFetch<MaterialResponse>(`/api/v1/materials/${publicCode}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function decommissionMaterial(publicCode: string, comment?: string): Promise<MaterialResponse> {
  const query = comment ? `?comment=${encodeURIComponent(comment)}` : '';
  return apiFetch<MaterialResponse>(`/api/v1/materials/${publicCode}${query}`, {
    method: 'DELETE',
  });
}

export async function reactivateMaterial(publicCode: string, comment?: string): Promise<MaterialResponse> {
  const query = comment ? `?comment=${encodeURIComponent(comment)}` : '';
  return apiFetch<MaterialResponse>(`/api/v1/materials/${publicCode}/reactivate${query}`, {
    method: 'POST',
  });
}

export async function regenerateQrCode(publicCode: string): Promise<MaterialResponse> {
  return apiFetch<MaterialResponse>(`/api/v1/materials/${publicCode}/qr/regenerate`, {
    method: 'POST',
  });
}

export async function fetchMaterialHistory(publicCode: string, page: number = 0, size: number = 20): Promise<PaginatedResponse<MaterialHistoryResponse>> {
  return apiFetch<PaginatedResponse<MaterialHistoryResponse>>(`/api/v1/inventory/materials/${publicCode}/history?page=${page}&size=${size}`);
}

export async function importMaterials(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<string>('/api/v1/materials/import', {
    method: 'POST',
    body: formData,
  });
}

export async function exportMaterials(): Promise<void> {
  const response = await authenticatedFetch('/api/v1/materials/export');
  if (!response.ok) {
    throw new Error('Error al exportar materiales');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventario_materiales.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function exportMaterialsToExcel(): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080');
  const response = await fetch(`${BASE_URL}/api/v1/materials/export/excel`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Error al exportar materiales a Excel');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventario_materiales.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function exportMaterialsToPdf(): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080');
  const response = await fetch(`${BASE_URL}/api/v1/materials/export/pdf`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Error al exportar materiales a PDF');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventario_materiales.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
