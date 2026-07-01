import { apiFetch } from '@/services/api-client';

export type RolesPermissionsMap = Record<string, string[]>;

export async function fetchRolesPermissions(): Promise<RolesPermissionsMap> {
  return apiFetch<RolesPermissionsMap>('/api/v1/roles');
}

export async function updateRolePermissions(role: string, permissions: string[]): Promise<RolesPermissionsMap> {
  return apiFetch<RolesPermissionsMap>(`/api/v1/roles/${role}/permissions`, {
    method: 'PUT',
    body: JSON.stringify(permissions),
  });
}
