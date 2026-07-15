import api from "@/lib/axios";

export type TenantStatus = "active" | "suspended";

export interface Tenant {
  id: number;
  tenantId?: string; // This will just be generated on frontend for display if backend doesn't provide it
  name: string;
  plan: string | null;
  members_count?: number;
  status: string;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  workspaces_assigned?: number;
}

export const tenantService = {
  getAll: async () => {
    const { data } = await api.get<Tenant[]>("/tenants/");
    return data;
  },
  
  create: async (tenant: Partial<Tenant>) => {
    const { data } = await api.post<Tenant>("/tenants/", tenant);
    return data;
  },
  
  update: async (id: number, tenant: Partial<Tenant>) => {
    const { data } = await api.put<Tenant>(`/tenants/${id}`, tenant);
    return data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/tenants/${id}`);
  }
};
