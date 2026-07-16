import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService, type Member, type RegisterPayload } from '../services/authService';

interface AuthContextValue {
  user: Member | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Member | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService
        .refreshMe()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const member = await authService.login(email, password);
    setUser(member);
  };

  const register = async (payload: RegisterPayload) => {
    const member = await authService.register(payload);
    setUser(member);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refresh = async () => {
    const member = await authService.refreshMe();
    setUser(member);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
