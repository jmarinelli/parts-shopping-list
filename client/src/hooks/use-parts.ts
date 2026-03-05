import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { Part } from '@/types';

const PARTS_KEY = 'parts';

export function useParts(optionId: string) {
  return useQuery({
    queryKey: [PARTS_KEY, optionId],
    queryFn: () => api.get<Part[]>(`/options/${optionId}/parts`),
    enabled: !!optionId,
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      optionId: string;
      partGroupId: string;
      projectId: string;
      name: string;
      price: number;
      currency: string;
      source?: string;
      link?: string;
      comment?: string;
    }) => {
      const { optionId, partGroupId, projectId, ...body } = variables;
      void partGroupId;
      void projectId;
      return api.post<Part>(`/options/${optionId}/parts`, body);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PARTS_KEY, variables.optionId] });
      queryClient.invalidateQueries({ queryKey: ['options', variables.partGroupId] });
      queryClient.invalidateQueries({ queryKey: ['part-groups', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Part created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      partId: string;
      optionId: string;
      partGroupId: string;
      projectId: string;
      name?: string;
      price?: number;
      currency?: string;
      source?: string | null;
      link?: string | null;
      comment?: string | null;
      status?: 'pending' | 'ordered' | 'owned';
    }) => {
      const { partId, optionId, partGroupId, projectId, ...body } = variables;
      void optionId;
      void partGroupId;
      void projectId;
      return api.put<Part>(`/parts/${partId}`, body);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PARTS_KEY, variables.optionId] });
      queryClient.invalidateQueries({ queryKey: ['options', variables.partGroupId] });
      queryClient.invalidateQueries({ queryKey: ['part-groups', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Part updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      partId: string;
      optionId: string;
      partGroupId: string;
      projectId: string;
    }) => api.delete(`/parts/${variables.partId}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PARTS_KEY, variables.optionId] });
      queryClient.invalidateQueries({ queryKey: ['options', variables.partGroupId] });
      queryClient.invalidateQueries({ queryKey: ['part-groups', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Part deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
