import api from '@/lib/axios';

// Example generic API service methods
export const apiService = {
  get: <T>(url: string, params?: Record<string, unknown>) => 
    api.get<T>(url, { params }).then(res => res.data),

  post: <T>(url: string, data: unknown) => 
    api.post<T>(url, data).then(res => res.data),

  put: <T>(url: string, data: unknown) => 
    api.put<T>(url, data).then(res => res.data),

  delete: <T>(url: string) => 
    api.delete<T>(url).then(res => res.data),
};
