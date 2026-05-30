import { apiFetch } from '@/services/api-client';
import { PaginatedResponse } from './material.service';

export interface UserResponse {
  publicId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string; // ADMIN, TECNICO
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export async function fetchUsers(page: number = 0, size: number = 20): Promise<PaginatedResponse<UserResponse>> {
  return apiFetch<PaginatedResponse<UserResponse>>(`/api/v1/users?page=${page}&size=${size}`);
}

export async function fetchUser(publicId: string): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/${publicId}`);
}

export async function createUser(data: UserCreateRequest): Promise<UserResponse> {
  return apiFetch<UserResponse>('/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(publicId: string, data: UserUpdateRequest): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/${publicId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function changeUserStatus(publicId: string, active: boolean): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/${publicId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
}

export async function changeUserPassword(publicId: string, password: string): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/${publicId}/password`, {
    method: 'PUT',
    body: JSON.stringify({ password }),
  });
}
