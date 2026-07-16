import { apiService } from './api';

export interface EnrolledMemberDto {
  id: number;
  member_id: number;
  methods: string[];
  status: string;
  enrolled_at: string;
  member_name: string | null;
  member_email: string | null;
  member_status: string | null;
}

export interface AccessLogDto {
  id: number;
  member_id: number | null;
  method: string | null;
  door: string | null;
  member_status: string | null;
  result: string;
  time: string;
  member_name: string | null;
  member_email: string | null;
}

export interface EnrollPayload {
  member_id: number;
  methods: string[];
  status?: string;
}

export interface AccessLogCreatePayload {
  member_id?: number | null;
  method?: string;
  door?: string;
  member_status?: string;
  result: string;
}

export interface EnrollmentLinkDto {
  token: string;
}

export const biometricService = {
  listEnrolled: () => apiService.get<EnrolledMemberDto[]>('/biometric/enrolled'),
  enroll: (data: EnrollPayload) => apiService.post<EnrolledMemberDto>('/biometric/enrolled', data),
  removeEnrolled: (id: number) => apiService.delete<void>(`/biometric/enrolled/${id}`),
  listLogs: () => apiService.get<AccessLogDto[]>('/biometric/logs'),
  createLog: (data: AccessLogCreatePayload) => apiService.post<AccessLogDto>('/biometric/logs', data),
  deleteLog: (id: number) => apiService.delete<void>(`/biometric/logs/${id}`),
  generateEnrollmentLink: (memberId: number) =>
    apiService.post<EnrollmentLinkDto>('/biometric/enrollment-links', { member_id: memberId }),
};
