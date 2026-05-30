import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MaterialsTable from './MaterialsTable';
import { fetchMaterials } from '../services/material.service';
import { fetchOffices } from '../services/office.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../services/material.service', () => ({
  fetchMaterials: vi.fn(),
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  decommissionMaterial: vi.fn(),
}));

vi.mock('../services/office.service', () => ({
  fetchOffices: vi.fn(),
}));

vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { publicId: '1', email: 'admin@vdenergy.es', role: 'ADMIN' },
  }),
}));

describe('MaterialsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers and records correctly', async () => {
    const mockMaterials = {
      content: [
        {
          publicCode: 'mat_1',
          materialType: 'Router',
          brand: 'MikroTik',
          model: 'RB4011',
          serialNumber: 'SN_TEST_1',
          description: 'MikroTik core router',
          status: 'OPERATIVO',
          officePublicId: 'off-1',
          officeName: 'Central Office',
          createdByName: 'John Doe',
          updatedByName: 'John Doe',
          createdAt: '2026-05-22T08:00:00Z',
          updatedAt: '2026-05-22T08:00:00Z',
        },
      ],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
      last: true,
    };

    const mockOffices = {
      content: [
        {
          publicId: 'off-1',
          name: 'Central Office',
          active: true,
          createdAt: '2026-05-22T08:00:00Z',
          updatedAt: '2026-05-22T08:00:00Z',
        },
      ],
      pageNumber: 0,
      pageSize: 100,
      totalElements: 1,
      totalPages: 1,
      last: true,
    };

    vi.mocked(fetchMaterials).mockResolvedValue(mockMaterials);
    vi.mocked(fetchOffices).mockResolvedValue(mockOffices);

    render(<MaterialsTable />);

    expect(screen.getByText('Inventario de Materiales')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('mat_1')).toBeInTheDocument();
      expect(screen.getAllByText('Router').length).toBeGreaterThan(0);
      expect(screen.getByText('SN_TEST_1')).toBeInTheDocument();
      expect(screen.getAllByText('Central Office').length).toBeGreaterThan(0);
    });
  });
});
