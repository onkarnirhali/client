import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getMe, logout, User } from '../api/auth';
import { API_BASE_URL } from '../app/config/env';
import { useSnackbar } from '../components/feedback/SnackbarProvider';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useSnackbar();
  const notifiedRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMe();
      setUser(res.user);
      setError(null);
      notifiedRef.current = false;
    } catch (err) {
      setUser(null);
      const message = err instanceof Error ? err.message : 'Unable to load session';
      setError(message);
      if (!notifiedRef.current) {
        notifiedRef.current = true;
        notify('Session expired. Please sign in again.', 'warning');
      }
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleLogin = () => {
    const base = API_BASE_URL || '';
    window.location.href = `${base}/auth/google`;
  };

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    setUser(null);
    notify('Signed out', 'info');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login: handleLogin, logout: handleLogout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
