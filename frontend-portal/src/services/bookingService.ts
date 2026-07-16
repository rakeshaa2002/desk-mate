import api from '../lib/axios';

export interface Booking {
  id: number;
  member_id: number;
  workspace_id: number;
  workspace_name: string | null;
  invoice_id: number | null;
  start_date: string;
  end_date: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface BookingCreatePayload {
  workspace_id: number;
  start_date: string;
  end_date: string;
}

export const bookingService = {
  listMine: () => api.get<Booking[]>('/bookings/').then((r) => r.data),
  create: (data: BookingCreatePayload) => api.post<Booking>('/bookings/', data).then((r) => r.data),
  cancel: (id: number) => api.delete(`/bookings/${id}`),
};
