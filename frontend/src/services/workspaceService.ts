import api from "@/lib/axios";

export interface Workspace {
  id: number;
  name: string;
  type: string;
  status: string;
  capacity: number;
  price_per_month: number;
  floor: string | null;
  amenities: string[];
  tenant_id?: number | null;
  is_active?: boolean;
}

export const workspaceService = {
  getAll: async () => {
    const { data } = await api.get<Workspace[]>("/workspaces/");
    return data;
  },

  create: async (workspace: Omit<Workspace, "id">) => {
    const { data } = await api.post<Workspace>("/workspaces/", workspace);
    return data;
  },

  update: async (id: number, workspace: Partial<Workspace>) => {
    const { data } = await api.put<Workspace>(`/workspaces/${id}`, workspace);
    return data;
  },

  cycleStatus: async (id: number) => {
    const { data } = await api.patch<Workspace>(`/workspaces/${id}/cycle-status`);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/workspaces/${id}`);
  }
};
