import type { Role, MembershipStatus, User } from "./mockData";
import { mockUsers } from "./mockData";
import api from "@/lib/axios";

const ROLE_MAP: Record<string, Role> = {
  super_admin: "Super Admin",
  org_admin: "Organization Admin",
  member: "Member",
};

const STATUS_MAP: Record<string, MembershipStatus> = {
  active: "Active",
  expired: "Expired",
  suspended: "Suspended",
  pending_approval: "Pending Approval",
};

export interface MemberOut {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company?: string | null;
  designation?: string | null;
  avatar?: string | null;
  phone?: string | null;
  membership_type?: string | null;
  subscription_start?: string | null;
  subscription_end?: string | null;
  role: string;
  status: string;
}

export function toUser(member: MemberOut): User {
  return {
    id: String(member.id),
    name: `${member.first_name} ${member.last_name}`.trim(),
    email: member.email,
    role: ROLE_MAP[member.role] ?? "Member",
    avatar: member.avatar ?? undefined,
    status: STATUS_MAP[member.status] ?? "Active",
    company: member.company ?? undefined,
    designation: member.designation ?? undefined,
    mobile: member.phone ?? undefined,
    membershipType: member.membership_type ?? undefined,
    subscriptionStart: member.subscription_start ?? undefined,
    subscriptionEnd: member.subscription_end ?? undefined,
  };
}

class AuthService {
  private currentUser: User | null = null;
  private readonly STORAGE_KEY = "deskmate_auth";
  private readonly TOKEN_KEY = "auth_token";

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const form = new URLSearchParams();
      form.set("username", email);
      form.set("password", password);
      const { data: token } = await api.post<{ access_token: string }>("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem(this.TOKEN_KEY, token.access_token);

      const { data: member } = await api.get<MemberOut>("/auth/me");
      const user = toUser(member);
      this.currentUser = user;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      localStorage.removeItem(this.TOKEN_KEY);
      const detail = err?.response?.data?.detail;
      throw new Error(typeof detail === "string" ? detail : "Invalid email or password");
    }
  }

  async loginWithBiometric(): Promise<User> {
    // No hardware biometric integration exists yet; this remains a UI simulation.
    // However, we now log in to the backend for real so that requests have a valid auth token.
    const useFirstDemoUser = Math.random() > 0.5;
    const email = useFirstDemoUser ? "sarah@startup.io" : "michael@expired.co";

    try {
      const form = new URLSearchParams();
      form.set("username", email);
      form.set("password", "password123");
      const { data: token } = await api.post<{ access_token: string }>("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem(this.TOKEN_KEY, token.access_token);

      const { data: member } = await api.get<MemberOut>("/auth/me");
      const user = toUser(member);
      this.currentUser = user;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      localStorage.removeItem(this.TOKEN_KEY);
      const detail = err?.response?.data?.detail;
      if (email === "michael@expired.co" || detail === "Membership has expired") {
        throw new Error("Your membership has expired. Please contact the workspace administrator to renew your subscription.");
      }
      throw new Error(typeof detail === "string" ? detail : "Biometric authentication failed");
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

export const authService = new AuthService();
