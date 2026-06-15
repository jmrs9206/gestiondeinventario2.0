import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UsersTable from './UsersTable';
import { fetchUsers } from '../services/user.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../services/user.service', () => ({
  fetchUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  changeUserStatus: vi.fn(),
  changeUserPassword: vi.fn(),
}));

vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { publicId: 'admin-1', email: 'admin@tuempresa.com', role: 'ADMIN' },
  }),
}));

describe('UsersTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user titles and lists user accounts correctly', async () => {
    const mockUsers = {
      content: [
        {
          publicId: 'user-1',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@tuempresa.com',
          role: 'TECNICO',
          active: true,
          createdAt: '2026-05-22T08:00:00Z',
          updatedAt: '2026-05-22T08:00:00Z',
        },
        {
          publicId: 'admin-1',
          firstName: 'Admin',
          lastName: 'Global',
          email: 'admin@tuempresa.com',
          role: 'ADMIN',
          active: true,
          createdAt: '2026-05-22T08:00:00Z',
          updatedAt: '2026-05-22T08:00:00Z',
        },
      ],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 2,
      totalPages: 1,
      last: true,
    };

    vi.mocked(fetchUsers).mockResolvedValue(mockUsers);

    render(<UsersTable />);

    expect(screen.getByText('Administración de Usuarios')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Juan/)).toBeInTheDocument();
      expect(screen.getByText(/Pérez/)).toBeInTheDocument();
      expect(screen.getByText('juan.perez@tuempresa.com')).toBeInTheDocument();
      expect(screen.getAllByText('Activo')[0]).toBeInTheDocument();
      expect(screen.getByText('Protegido (Sistema)')).toBeInTheDocument();
    });
  });
});
