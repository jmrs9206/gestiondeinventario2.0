import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner when auth loading is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Verificando sesión...')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('redirects to login when user is unauthenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Content</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalled();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders access denied message when user role is not allowed', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { publicId: '1', email: 't@vdenergy.es', role: 'TECNICO' },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div>Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated and role is allowed', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { publicId: '1', email: 'a@vdenergy.es', role: 'ADMIN' },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div>Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Acceso Denegado')).not.toBeInTheDocument();
  });
});
