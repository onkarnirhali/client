import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { disconnectProvider, listProviders, Provider, toggleProviderIngest } from '../../api/providers';

const PROVIDERS_KEY = ['providers'];

export function useProviders() {
  return useQuery({
    queryKey: PROVIDERS_KEY,
    queryFn: async () => {
      const res = await listProviders();
      return res.providers;
    },
    staleTime: 60_000,
  });
}

export function useDisconnectProvider() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => disconnectProvider(provider),
    onSuccess: () => client.invalidateQueries({ queryKey: PROVIDERS_KEY }),
  });
}

export function useToggleProviderIngest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, ingestEnabled }: { provider: string; ingestEnabled: boolean }) =>
      toggleProviderIngest(provider, ingestEnabled),
    onSuccess: () => client.invalidateQueries({ queryKey: PROVIDERS_KEY }),
  });
}

export type { Provider };
