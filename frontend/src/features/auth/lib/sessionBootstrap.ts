import { getMe, refreshAccessToken } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

let bootstrapPromise: Promise<void> | null = null;

async function runBootstrap(): Promise<void> {
  try {
    const { accessToken } = await refreshAccessToken();
    useAuthStore.setState({ accessToken });
    const { user } = await getMe();
    useAuthStore.getState().setSession(accessToken, user);
  } catch {
    useAuthStore.getState().clearSession();
  }
}

export function bootstrapSession(): Promise<void> {
  bootstrapPromise ??= runBootstrap();
  return bootstrapPromise;
}