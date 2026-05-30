import { apiFetch } from '@/services/api-client';
import { PaginatedResponse } from './material.service';

export interface OfficeResponse {
  publicId: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeRequest {
  name: string;
}

export async function fetchOffices(page: number = 0, size: number = 20): Promise<PaginatedResponse<OfficeResponse>> {
  return apiFetch<PaginatedResponse<OfficeResponse>>(`/api/v1/offices?page=${page}&size=${size}`);
}

export async function fetchOffice(publicId: string): Promise<OfficeResponse> {
  return apiFetch<OfficeResponse>(`/api/v1/offices/${publicId}`);
}

export async function createOffice(data: OfficeRequest): Promise<OfficeResponse> {
  return apiFetch<OfficeResponse>('/api/v1/offices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOffice(publicId: string, data: OfficeRequest): Promise<OfficeResponse> {
  return apiFetch<OfficeResponse>(`/api/v1/offices/${publicId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOffice(publicId: string): Promise<OfficeResponse> {
  return apiFetch<OfficeResponse>(`/api/v1/offices/${publicId}`, {
    method: 'DELETE',
  });
}
