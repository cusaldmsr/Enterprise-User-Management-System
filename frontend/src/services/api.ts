import api from '../lib/axios';
import type {
  LoginPayload,
  LoginResponse,
  ApiResponse,
  User,
  PaginatedResponse,
  DashboardAnalytics,
  AuditLog,
  Role,
  CreateUserPayload,
  UpdateUserPayload,
  Notification,
  Document,
} from '../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', payload),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
};

// ─── Users ─────────────────────────────────────────────────────────────────────

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string;
}

export const usersApi = {
  getAll: (params: UsersQuery = {}) =>
    api.get<PaginatedResponse<User>>('/api/users', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<User>>(`/api/users/${id}`),

  create: (payload: CreateUserPayload) =>
    api.post<ApiResponse<User>>('/api/users', payload),

  update: (id: string, payload: UpdateUserPayload) =>
    api.put<ApiResponse<User>>(`/api/users/${id}`, payload),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/users/${id}`),

  getDashboard: () =>
    api.get<ApiResponse<DashboardAnalytics>>('/api/users/analytics/dashboard'),

  getAuditLogs: (params: { page?: number; limit?: number } = {}) =>
    api.get<{ success: boolean; meta: object; data: AuditLog[] }>('/api/users/audit-logs', { params }),

  getRoles: () =>
    api.get<ApiResponse<Role[]>>('/api/users/roles'),
};

// ─── Upload ────────────────────────────────────────────────────────────────────

export const uploadApi = {
  profileImage: (file: File, userId?: string) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    const url = userId ? `/api/upload/profile/${userId}` : '/api/upload/profile';
    return api.post<ApiResponse<{ profileImage: string }>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  document: (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post<ApiResponse<Document>>('/api/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getDocuments: (params: { page?: number; limit?: number } = {}) =>
    api.get<{ success: boolean; meta: object; data: Document[] }>('/api/upload/documents', { params }),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: (params: { page?: number; limit?: number } = {}) =>
    api.get<{ success: boolean; meta: { unreadCount: number; total: number }; data: Notification[] }>(
      '/api/notifications',
      { params }
    ),

  markAsRead: (id: string) =>
    api.patch<ApiResponse<Notification>>(`/api/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/api/notifications/read-all'),

  delete: (id: string) => api.delete(`/api/notifications/${id}`),
};
