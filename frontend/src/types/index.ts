export interface Permission {
  _id: string;
  name: string;
  description?: string;
}

export interface Role {
  _id: string;
  name: 'ADMIN' | 'MANAGER' | 'USER';
  permissions: Permission[];
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

export interface PaginationMeta {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  meta: PaginationMeta;
  data: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface DashboardAnalytics {
  totalUsers: number;
  totalAdmins: number;
  totalManagers: number;
  totalRegularUsers: number;
  activeAccounts: number;
  inactiveAccounts: number;
  recentActivity: AuditLog[];
}

export interface AuditLog {
  _id: string;
  userId: Pick<User, '_id' | 'firstName' | 'lastName' | 'email' | 'profileImage'>;
  action: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Document {
  _id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: Pick<User, '_id' | 'firstName' | 'lastName' | 'email'>;
  createdAt: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
  password?: string;
}
