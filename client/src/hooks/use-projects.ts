import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { Project } from '@/types';

export function useProjects(carId: string) {
  return useQuery({
    queryKey: ['projects', carId],
    queryFn: () => api.get<Project[]>(`/cars/${carId}/projects`),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { carId: string; name: string }) =>
      api.post<Project>(`/cars/${data.carId}/projects`, { name: data.name }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.carId] });
      toast.success('Project created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string; carId: string; data: { name: string } }) =>
      api.put<Project>(`/projects/${variables.id}`, variables.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.carId] });
      toast.success('Project updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string; carId: string }) =>
      api.delete(`/projects/${variables.id}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.carId] });
      toast.success('Project deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
