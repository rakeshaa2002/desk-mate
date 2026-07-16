import { apiService } from "./api";

export interface RoleDto {
  id: number;
  name: string;
  permissions: string[];
  tenant_id: number | null;
}

export interface RoleCreatePayload {
  name: string;
  permissions: string[];
}

export interface RoleUpdatePayload {
  name?: string;
  permissions?: string[];
}

export const roleService = {
  list: () => apiService.get<RoleDto[]>("/roles/"),
  create: (data: RoleCreatePayload) => apiService.post<RoleDto>("/roles/", data),
  update: (id: number, data: RoleUpdatePayload) => apiService.put<RoleDto>(`/roles/${id}`, data),
  remove: (id: number) => apiService.delete<void>(`/roles/${id}`),
};
