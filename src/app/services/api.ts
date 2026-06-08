import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  },
);

export type UserRole = 'student' | 'faculty' | 'researcher' | 'visitor' | 'admin';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  monthly_access_count: number;
  is_active: boolean;
  institution?: string | null;
  major?: string | null;
  year?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export const setSession = (data: AuthResponse) => {
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
};

export const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

export const getStoredUser = (): ApiUser | null => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
};

export const auth = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    institution?: string;
    major?: string;
    year?: string;
  }) => api.post<AuthResponse>('/auth/register', data),
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  getProfile: () => api.get<ApiUser>('/auth/me'),
  updateProfile: (data: Partial<Pick<ApiUser, 'name' | 'institution' | 'major' | 'year'>>) =>
    api.put<ApiUser>('/auth/me', data),
};

export const resources = {
  list: (params?: {
    category?: string;
    q?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/resources', { params }),
  get: (id: string) => api.get(`/resources/${id}`),
  create: (data: Record<string, unknown>) => api.post('/resources', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/resources/${id}`, data),
  delete: (id: string) => api.delete(`/resources/${id}`),
  requestAccess: (id: string, message?: string) =>
    api.post(`/resources/${id}/request-access`, { message }),
  addReview: (id: string, rating: number, comment: string) =>
    api.post(`/resources/${id}/reviews`, { rating, comment }),
};

export const user = {
  getActivities: () => api.get('/user/activities'),
  getCalendar: () => api.get('/user/calendar'),
  addCalendarEvent: (event: Record<string, unknown>) => api.post('/user/calendar', event),
  deleteCalendarEvent: (id: string) => api.delete(`/user/calendar/${id}`),
  getNotifications: () => api.get('/user/notifications'),
  markNotificationRead: (id: string) => api.post(`/user/notifications/${id}/read`),
  markAllNotificationsRead: () => api.post('/user/notifications/read-all'),
};

export const admin = {
  getAccessRequests: (status = 'pending') =>
    api.get('/admin/access-requests', { params: { status } }),
  approveAccess: (id: string) => api.post(`/admin/access-requests/${id}/approve`),
  rejectAccess: (id: string) => api.post(`/admin/access-requests/${id}/reject`),
  getUploadApprovals: (status = 'pending') =>
    api.get('/admin/upload-approvals', { params: { status } }),
  approveUpload: (id: string) => api.post(`/admin/upload-approvals/${id}/approve`),
  rejectUpload: (id: string) => api.post(`/admin/upload-approvals/${id}/reject`),
  getReports: (status = 'pending') => api.get('/admin/reports', { params: { status } }),
  resolveReport: (id: string) => api.post(`/admin/reports/${id}/resolve`),
  dismissReport: (id: string) => api.post(`/admin/reports/${id}/dismiss`),
  getUsers: (q = '') => api.get('/admin/users', { params: { q } }),
  suspendUser: (id: string) => api.post(`/admin/users/${id}/suspend`),
  activateUser: (id: string) => api.post(`/admin/users/${id}/activate`),
  getActivities: () => api.get('/admin/activities'),
};

export default api;
