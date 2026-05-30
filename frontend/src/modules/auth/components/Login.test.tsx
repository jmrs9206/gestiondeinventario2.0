import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../../../app/login/page';
import { useAuth } from '@/modules/auth/hooks/useAuth';

// Mock Next.js router navigation and search params
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

// Mock the custom useAuth hook
vi.mock('@/modules/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('LoginPage Component Tests', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renders form inputs and submit button properly', () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      loading: false,
      user: null,
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(<LoginPage />);

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acceder al panel/i })).toBeInTheDocument();
  });

  it('2. Client-Side Validation: shows error when required fields are empty', async () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      loading: false,
      user: null,
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(<LoginPage />);

    const submitBtn = screen.getByRole('button', { name: /acceder al panel/i });
    const form = submitBtn.closest('form');
    fireEvent.submit(form!);

    expect(await screen.findByText(/por favor, rellene todos los campos/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('3. Happy Path: authenticates successfully and redirects to dashboard', async () => {
    const authState = {
      login: mockLogin,
      isAuthenticated: false,
      loading: false,
      user: null,
      logout: vi.fn(),
      refreshSession: vi.fn(),
    };
    
    vi.mocked(useAuth).mockImplementation(() => authState);
    mockLogin.mockImplementationOnce(async () => {
      authState.isAuthenticated = true;
      authState.user = { role: 'ADMIN', email: 'admin@vdenergy.es', name: 'Admin' } as any;
      return Promise.resolve();
    });

    const { rerender } = render(<LoginPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /acceder al panel/i });

    fireEvent.change(emailInput, { target: { value: 'admin@vdenergy.es' } });
    fireEvent.change(passwordInput, { target: { value: 'securepassword123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@vdenergy.es', 'securepassword123');
    });

    rerender(<LoginPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('4. Error Case: displays API authentication error when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales incorrectas. Intente de nuevo.'));
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      loading: false,
      user: null,
      logout: vi.fn(),
      refreshSession: vi.fn(),
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitBtn = screen.getByRole('button', { name: /acceder al panel/i });

    fireEvent.change(emailInput, { target: { value: 'tecnico@vdenergy.es' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/credenciales incorrectas. intente de nuevo./i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
