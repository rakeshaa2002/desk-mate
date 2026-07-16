import { startRegistration, startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser';
import api from '../lib/axios';

export type BiometricMethod = 'Fingerprint' | 'Face';

export interface AttendanceRecord {
  id: number;
  member_id: number;
  workspace_id: number | null;
  date: string;
  check_in: string;
  check_out: string | null;
  flag: string;
}

export interface EnrollmentStatus {
  enrolled: boolean;
  methods: BiometricMethod[];
}

export const webauthnService = {
  supported: () => browserSupportsWebAuthn(),

  status: () => api.get<EnrollmentStatus>('/webauthn/status').then((r) => r.data),

  async enroll(method: BiometricMethod): Promise<{ enrolled: boolean; method: string }> {
    const { data: optionsJSON } = await api.post('/webauthn/register/options', { method });
    const credential = await startRegistration({ optionsJSON });
    const { data } = await api.post('/webauthn/register/verify', { method, credential });
    return data;
  },

  async checkInOrOut(): Promise<{ action: 'check-in' | 'check-out'; time: string }> {
    const { data: optionsJSON } = await api.post('/webauthn/checkin/options');
    const credential = await startAuthentication({ optionsJSON });
    const { data } = await api.post('/webauthn/checkin/verify', { credential });
    return data;
  },

  listMyAttendance: () => api.get<AttendanceRecord[]>('/attendance/mine').then((r) => r.data),
};
