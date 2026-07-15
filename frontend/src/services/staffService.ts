import { apiService } from "./api";

export type StaffStatus = "Active" | "Inactive" | "Invited";

export interface StaffMemberDto {
  id: number;
  name: string;
  email: string;
  role: string;
  status: StaffStatus;
  joined_date: string;
  tenant_id: number | null;
}

export interface StaffCreatePayload {
  name: string;
  email: string;
  role: string;
  status: StaffStatus;
  password?: string;
}

export interface StaffUpdatePayload {
  name?: string;
  email?: string;
  role?: string;
  status?: StaffStatus;
  password?: string;
}

export const staffService = {
  list: () => apiService.get<StaffMemberDto[]>("/staff/"),
  create: (data: StaffCreatePayload) => apiService.post<StaffMemberDto>("/staff/", data),
  update: (id: number, data: StaffUpdatePayload) => apiService.put<StaffMemberDto>(`/staff/${id}`, data),
  remove: (id: number) => apiService.delete<void>(`/staff/${id}`),
};
