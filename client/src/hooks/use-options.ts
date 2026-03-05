import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { Option, Part } from '@/types';

export function useOptions(partId: string) {
  return useQuery({
    queryKey: ['options', partId],
    queryFn: () => api.get<Option[]>(`/parts/${partId}/options`),
    enabled: !!partId,
  });
}

export function useCreateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      partId: string;
      projectId: string;
      name: string;
      price: number;
      currency: string;
      source?: string;
      link?: string;
      comment?: string;
    }) => {
      const { partId, projectId, ...body } = data;
      void projectId;
      return api.post<Option>(`/parts/${partId}/options`, body);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['options', variables.partId] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Option created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      id: string;
      partId: string;
      projectId: string;
      data: {
        name?: string;
        price?: number;
        currency?: string;
        source?: string | null;
        link?: string | null;
        comment?: string | null;
      };
    }) => api.put<Option>(`/options/${variables.id}`, variables.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['options', variables.partId] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Option updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string; partId: string; projectId: string }) =>
      api.delete(`/options/${variables.id}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['options', variables.partId] });
      queryClient.invalidateQueries({ queryKey: ['parts', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Option deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSelectOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { partId: string; optionId: string; projectId: string }) =>
      api.patch<Part>(`/parts/${variables.partId}/options/${variables.optionId}/select`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parts', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Option selected');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
