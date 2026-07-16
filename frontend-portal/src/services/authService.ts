import api, { TOKEN_KEY } from '../lib/axios';

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  workspace_id: number | null;
}

const USER_KEY = 'portal_user';

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
}

export const authService = {
  getCurrentUser(): Member | null {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  async register(payload: RegisterPayload): Promise<Member> {
    const { data: token } = await api.post<{ access_token: string }>('/auth/register', payload);
    localStorage.setItem(TOKEN_KEY, token.access_token);
    return authService.refreshMe();
  },

  async login(email: string, password: string): Promise<Member> {
    const form = new URLSearchParams();
    form.set('username', email);
    form.set('password', password);
    const { data: token } = await api.post<{ access_token: string }>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    localStorage.setItem(TOKEN_KEY, token.access_token);
    return authService.refreshMe();
  },

  async refreshMe(): Promise<Member> {
    const { data: member } = await api.get<Member>('/auth/me');
    localStorage.setItem(USER_KEY, JSON.stringify(member));
    return member;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export function extractErrorMessage(err: unknown, fallback: string): string {
  const detail = (err as any)?.response?.data?.detail;
  return typeof detail === 'string' ? detail : fallback;
}
