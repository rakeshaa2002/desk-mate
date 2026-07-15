import { apiService } from "./api";

export interface OrgSettings {
  id: number;
  tenant_id: number | null;
  org_name: string | null;
  support_email: string | null;
  currency: string;
  gst_rate: number;
}

export interface OrgSettingsUpdate {
  org_name?: string;
  support_email?: string;
  currency?: string;
  gst_rate?: number;
}

export const settingsService = {
  get: () => apiService.get<OrgSettings>("/settings/"),
  update: (data: OrgSettingsUpdate) => apiService.put<OrgSettings>("/settings/", data),
};
