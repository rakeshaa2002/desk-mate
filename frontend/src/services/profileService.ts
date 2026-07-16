import { apiService } from "./api";
import { authService, toUser, type MemberOut } from "./authService";

export type { MemberOut };

export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  current_password?: string;
  new_password?: string;
}

export const profileService = {
  get: () => apiService.get<MemberOut>("/auth/me"),
  update: async (data: ProfileUpdatePayload) => {
    const member = await apiService.put<MemberOut>("/auth/me", data);
    authService.setCurrentUser(toUser(member));
    return member;
  },
};
