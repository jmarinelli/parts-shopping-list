import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { PartGroup } from '@/types';

const PART_GROUPS_KEY = 'part-groups';

export function usePartGroups(projectId: string) {
  return useQuery({
    queryKey: [PART_GROUPS_KEY, projectId],
    queryFn: () => api.get<PartGroup[]>(`/projects/${projectId}/part-groups`),
  });
}

export function useCreatePartGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { projectId: string; name: string; isOptional?: boolean }) =>
      api.post<PartGroup>(`/projects/${variables.projectId}/part-groups`, {
        name: variables.name,
        isOptional: variables.isOptional,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PART_GROUPS_KEY, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Part group created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePartGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      partGroupId: string;
      projectId: string;
      name?: string;
      isOptional?: boolean;
    }) => {
      const { partGroupId, projectId, ...body } = variables;
      void projectId;
      return api.put<PartGroup>(`/part-groups/${partGroupId}`, body);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PART_GROUPS_KEY, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Part group updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePartGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { partGroupId: string; projectId: string }) =>
      api.delete(`/part-groups/${variables.partGroupId}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PART_GROUPS_KEY, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Part group deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useReorderPartGroups() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { projectId: string; orderedIds: string[] }) =>
      api.patch<PartGroup[]>(`/projects/${variables.projectId}/part-groups/reorder`, {
        orderedIds: variables.orderedIds,
      }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: [PART_GROUPS_KEY, variables.projectId] });

      const previousPartGroups = queryClient.getQueryData<PartGroup[]>([
        PART_GROUPS_KEY,
        variables.projectId,
      ]);

      if (previousPartGroups) {
        const reordered = variables.orderedIds
          .map((id) => previousPartGroups.find((pg) => pg.id === id))
          .filter(Boolean) as PartGroup[];
        queryClient.setQueryData([PART_GROUPS_KEY, variables.projectId], reordered);
      }

      return { previousPartGroups };
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousPartGroups) {
        queryClient.setQueryData(
          [PART_GROUPS_KEY, variables.projectId],
          context.previousPartGroups,
        );
      }
      toast.error(error.message);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: [PART_GROUPS_KEY, variables.projectId] });
    },
  });
}
