import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  adminLogin,
  clientLogin,
  clientRegister,
  logout as apiLogout,
} from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type {
  AdminLoginInput,
  AuthUser,
  ClientLoginInput,
  ClientRegisterInput,
} from '../types/auth.types';

type LoginLocationState = { from?: string } | null;

function useAuthSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  const openSession = (accessToken: string, user: AuthUser, fallback: string) => {
    const state = location.state as LoginLocationState;
    setSession(accessToken, user);
    navigate(state?.from ?? fallback, { replace: true });
  };

  return { openSession };
}

export function useClientLogin() {
  const { openSession } = useAuthSession();

  return useMutation({
    mutationFn: (input: ClientLoginInput) => clientLogin(input),
    onSuccess: ({ accessToken, user }) => {
      openSession(accessToken, user, '/');
    },
  });
}

export function useClientRegister() {
  const { openSession } = useAuthSession();

  return useMutation({
    mutationFn: (input: ClientRegisterInput) => clientRegister(input),
    onSuccess: ({ accessToken, user }) => {
      openSession(accessToken, user, '/');
    },
  });
}

export function useAdminLogin() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (input: AdminLoginInput) => adminLogin(input),
    onSuccess: ({ accessToken, user }) => {
      setSession(accessToken, user);
      navigate('/admin', { replace: true });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Si falla (token expirado, red, etc.) la sesión local se limpia igual
    } finally {
      clearSession();
      navigate('/', { replace: true });
    }
  };

  return handleLogout;
}