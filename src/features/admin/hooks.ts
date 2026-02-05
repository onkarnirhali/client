import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getAdminSummary,
  listAdminEvents,
  listAdminIntegrations,
  listAdminUsers,
  listAdminUsersByRole,
  updateAdminUser,
  AdminEvent,
  AdminIntegration,
  AdminSummary,
  AdminUser,
} from '../../api/admin';

export function useAdminSummary() {
  return useQuery<AdminSummary>({
    queryKey: ['admin', 'summary'],
    queryFn: async () => getAdminSummary(),
    staleTime: 30_000,
  });
}

export function useAdminUsers(limit: number, offset: number, role?: string | null) {
  return useQuery<{ items: AdminUser[]; total: number; limit: number; offset: number }>({
    queryKey: ['admin', 'users', role || 'all', limit, offset],
    queryFn: async () => (role ? listAdminUsersByRole(limit, offset, role) : listAdminUsers(limit, offset)),
  });
}

export function useUpdateAdminUser() {
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { role?: string; isEnabled?: boolean } }) =>
      updateAdminUser(id, payload),
  });
}

export function useAdminEvents(limit: number, offset: number) {
  return useQuery<{ items: AdminEvent[]; total: number; limit: number; offset: number }>({
    queryKey: ['admin', 'events', limit, offset],
    queryFn: async () => listAdminEvents(limit, offset),
  });
}

export function useAdminIntegrations(limit: number, offset: number) {
  return useQuery<{ items: AdminIntegration[]; total: number; limit: number; offset: number }>({
    queryKey: ['admin', 'integrations', limit, offset],
    queryFn: async () => listAdminIntegrations(limit, offset),
  });
}
