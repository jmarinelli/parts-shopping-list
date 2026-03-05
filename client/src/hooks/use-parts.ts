import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { Part } from '@/types';

export function useParts(projectId: string) {
  return useQuery({
    queryKey: ['parts', projectId],
    queryFn: () => api.get<Part[]>(`/projects/${projectId}/parts`),
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; name: string }) =>
      api.post<Part>(`/projects/${data.projectId}/parts`, { name: data.name }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parts', variables.projectId] });
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
      id: string;
      projectId: string;
      data: { name?: string; status?: string; isOptional?: boolean };
    }) => api.put<Part>(`/parts/${variables.id}`, variables.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parts', variables.projectId] });
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
    mutationFn: (variables: { id: string; projectId: string }) =>
      api.delete(`/parts/${variables.id}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parts', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Part deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useReorderParts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { projectId: string; orderedIds: string[] }) =>
      api.patch<Part[]>(`/projects/${variables.projectId}/parts/reorder`, {
        orderedIds: variables.orderedIds,
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['parts', variables.projectId] });

      const previousParts = queryClient.getQueryData<Part[]>(['parts', variables.projectId]);

      if (previousParts) {
        const reordered = variables.orderedIds
          .map((id) => previousParts.find((p) => p.id === id))
          .filter(Boolean) as Part[];
        queryClient.setQueryData(['parts', variables.projectId], reordered);
      }

      return { previousParts };
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousParts) {
        queryClient.setQueryData(['parts', variables.projectId], context.previousParts);
      }
      toast.error(error.message);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parts', variables.projectId] });
    },
  });
}
