import { useQuery } from '@tanstack/react-query';
import {
  getAdminSummary,
  listAdminEvents,
  listAdminIntegrations,
  listAdminUsers,
} from '../../api/admin';

export function useAdminSummary() {
  return useQuery({
    queryKey: ['admin', 'summary'],
    queryFn: async () => getAdminSummary(),
    staleTime: 30_000,
  });
}

export function useAdminUsers(limit: number, offset: number) {
  return useQuery({
    queryKey: ['admin', 'users', limit, offset],
    queryFn: async () => listAdminUsers(limit, offset),
    keepPreviousData: true,
  });
}

export function useAdminEvents(limit: number, offset: number) {
  return useQuery({
    queryKey: ['admin', 'events', limit, offset],
    queryFn: async () => listAdminEvents(limit, offset),
    keepPreviousData: true,
  });
}

export function useAdminIntegrations(limit: number, offset: number) {
  return useQuery({
    queryKey: ['admin', 'integrations', limit, offset],
    queryFn: async () => listAdminIntegrations(limit, offset),
    keepPreviousData: true,
  });
}
