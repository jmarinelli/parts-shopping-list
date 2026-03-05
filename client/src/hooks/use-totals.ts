import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { ProjectTotals } from '@/types';

export function useTotals(
  projectId: string,
  currency: string | null,
  includeOptionals: boolean,
) {
  const params = new URLSearchParams();
  if (currency) params.set('currency', currency);
  params.set('includeOptionals', String(includeOptionals));

  return useQuery({
    queryKey: ['totals', projectId, currency, includeOptionals],
    queryFn: () =>
      api.get<ProjectTotals>(
        `/projects/${projectId}/totals?${params.toString()}`,
      ),
    enabled: !!projectId,
    retry: false,
  });
}
