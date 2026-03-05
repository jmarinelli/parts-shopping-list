import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { Option, PartGroup } from '@/types';

const OPTIONS_KEY = 'options';

export function useOptions(partGroupId: string) {
  return useQuery({
    queryKey: [OPTIONS_KEY, partGroupId],
    queryFn: () => api.get<Option[]>(`/part-groups/${partGroupId}/options`),
    enabled: !!partGroupId,
  });
}

export function useCreateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      partGroupId: string;
      projectId: string;
      name: string;
      firstPart: {
        name: string;
        price: number;
        currency: string;
        source?: string;
        link?: string;
        comment?: string;
      };
    }) => {
      const { partGroupId, projectId, ...body } = variables;
      void projectId;
      return api.post<Option>(`/part-groups/${partGroupId}/options`, body);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [OPTIONS_KEY, variables.partGroupId] });
      queryClient.invalidateQueries({ queryKey: ['part-groups', variables.projectId] });
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
      optionId: string;
      partGroupId: string;
      projectId: string;
      name?: string;
    }) => {
      const { optionId, partGroupId, projectId, ...body } = variables;
      void partGroupId;
      void projectId;
      return api.put<Option>(`/options/${optionId}`, body);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [OPTIONS_KEY, variables.partGroupId] });
      queryClient.invalidateQueries({ queryKey: ['part-groups', variables.projectId] });
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
    mutationFn: (variables: { optionId: string; partGroupId: string; projectId: string }) =>
      api.delete(`/options/${variables.optionId}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [OPTIONS_KEY, variables.partGroupId] });
      queryClient.invalidateQueries({ queryKey: ['part-groups', variables.projectId] });
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
    mutationFn: (variables: { partGroupId: string; optionId: string; projectId: string }) =>
      api.patch<PartGroup>(
        `/part-groups/${variables.partGroupId}/options/${variables.optionId}/select`,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['part-groups', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['totals', variables.projectId] });
      toast.success('Option selected');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
