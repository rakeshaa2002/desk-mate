import { startRegistration } from '@simplewebauthn/browser';
import api from '../lib/axios';
import type { BiometricMethod } from './webauthnService';

export interface EnrollmentLinkInfo {
  member_name: string;
  member_email: string;
}

export const enrollLinkService = {
  getInfo: (token: string) => api.get<EnrollmentLinkInfo>(`/enroll-link/${token}`).then((r) => r.data),

  async enroll(token: string, method: BiometricMethod): Promise<{ enrolled: boolean; member_name: string }> {
    const { data: optionsJSON } = await api.post(`/enroll-link/${token}/options`, { method });
    const credential = await startRegistration({ optionsJSON });
    const { data } = await api.post(`/enroll-link/${token}/verify`, { method, credential });
    return data;
  },
};
