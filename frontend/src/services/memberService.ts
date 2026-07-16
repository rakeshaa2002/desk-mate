import { apiService } from './api';

export interface MemberDto {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

export const memberService = {
  list: () => apiService.get<MemberDto[]>('/members/'),
};
