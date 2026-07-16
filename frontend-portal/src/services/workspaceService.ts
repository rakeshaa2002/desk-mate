import api from '../lib/axios';

export interface Workspace {
  id: number;
  name: string;
  type: string;
  status: string;
  capacity: number;
  price_per_month: number;
  floor: string | null;
  amenities: string[];
  is_active: boolean;
}

export const workspaceService = {
  list: () => api.get<Workspace[]>('/workspaces/').then((r) => r.data),
};
