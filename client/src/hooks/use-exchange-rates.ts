import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { ExchangeRate } from '@/types';

export function useExchangeRates(projectId: string) {
  return useQuery({
    queryKey: ['exchange-rates', projectId],
    queryFn: () =>
      api.get<ExchangeRate[]>(`/projects/${projectId}/exchange-rates`),
    enabled: !!projectId,
  });
}

export function useUpdateExchangeRates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      projectId: string;
      rates: { fromCurrency: string; toCurrency: string; rate: number }[];
    }) =>
      api.put<ExchangeRate[]>(
        `/projects/${variables.projectId}/exchange-rates`,
        { rates: variables.rates },
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['exchange-rates', variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['totals', variables.projectId],
      });
      toast.success('Exchange rates updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
