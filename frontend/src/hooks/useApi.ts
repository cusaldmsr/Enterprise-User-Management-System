import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, uploadApi, notificationsApi, type UsersQuery } from '../services/api';
import { useAuthStore } from '../store/authStore';

// ─── Keys ─────────────────────────────────────────────────────────────────────
export const queryKeys = {
  users: (params: UsersQuery) => ['users', params] as const,
  user: (id: string) => ['user', id] as const,
  dashboard: ['dashboard'] as const,
  auditLogs: (page: number) => ['auditLogs', page] as const,
  roles: ['roles'] as const,
  notifications: ['notifications'] as const,
  documents: (page: number) => ['documents', page] as const,
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const useUsers = (params: UsersQuery = {}) =>
  useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => usersApi.getAll(params).then((r) => r.data),
  });

export const useUser = (id: string) =>
  useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => usersApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useDashboard = () =>
  useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => usersApi.getDashboard().then((r) => r.data.data),
    refetchInterval: 60000, // refresh every minute
  });

export const useAuditLogs = (page = 1) =>
  useQuery({
    queryKey: queryKeys.auditLogs(page),
    queryFn: () => usersApi.getAuditLogs({ page, limit: 20 }).then((r) => r.data),
  });

export const useRoles = () =>
  useQuery({
    queryKey: queryKeys.roles,
    queryFn: () => usersApi.getRoles().then((r) => r.data.data),
    staleTime: Infinity,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof usersApi.update>[1] }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['user'] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

// ─── Upload ───────────────────────────────────────────────────────────────────
export const useUploadProfileImage = () => {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: ({ file, userId }: { file: File; userId?: string }) =>
      uploadApi.profileImage(file, userId),
    onSuccess: (res, vars) => {
      if (!vars.userId) {
        updateUser({ profileImage: res.data.data.profileImage });
      }
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUploadDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadApi.document(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
};

export const useDocuments = (page = 1) =>
  useQuery({
    queryKey: queryKeys.documents(page),
    queryFn: () => uploadApi.getDocuments({ page, limit: 10 }).then((r) => r.data),
  });

// ─── Notifications ────────────────────────────────────────────────────────────
export const useNotifications = () =>
  useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationsApi.getAll({ limit: 20 }).then((r) => r.data),
    refetchInterval: 30000,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};
