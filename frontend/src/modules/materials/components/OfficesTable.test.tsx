import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OfficesTable from './OfficesTable';
import { fetchOffices } from '../services/office.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../services/office.service', () => ({
  fetchOffices: vi.fn(),
  createOffice: vi.fn(),
  updateOffice: vi.fn(),
  deleteOffice: vi.fn(),
  reactivateOffice: vi.fn(),
}));

describe('OfficesTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders office titles and office listings correctly', async () => {
    const mockOffices = {
      content: [
        {
          publicId: 'office-uuid-1',
          name: 'OFICINA CENTRAL SEVILLA',
          active: true,
          createdAt: '2026-05-22T08:00:00Z',
          updatedAt: '2026-05-22T08:00:00Z',
        },
        {
          publicId: 'office-uuid-2',
          name: 'SEDE BARCELONA NORTE',
          active: false,
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

    vi.mocked(fetchOffices).mockResolvedValue(mockOffices);

    render(<OfficesTable />);

    expect(screen.getByText('Oficinas / Sedes')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('OFICINA CENTRAL SEVILLA')).toBeInTheDocument();
      expect(screen.getByText('SEDE BARCELONA NORTE')).toBeInTheDocument();
      expect(screen.getByText('Activa')).toBeInTheDocument();
      expect(screen.getByText('Inactiva')).toBeInTheDocument();
    });
  });
});
