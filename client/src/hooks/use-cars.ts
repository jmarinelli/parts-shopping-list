import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { Car } from '@/types';

const CARS_KEY = ['cars'];

export function useCars() {
  return useQuery({
    queryKey: CARS_KEY,
    queryFn: () => api.get<Car[]>('/cars'),
  });
}

export function useCar(carId: string) {
  return useQuery({
    queryKey: ['cars', carId],
    queryFn: () => api.get<Car>(`/cars/${carId}`),
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => api.post<Car>('/cars', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARS_KEY });
      toast.success('Car created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      api.put<Car>(`/cars/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARS_KEY });
      toast.success('Car updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/cars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARS_KEY });
      toast.success('Car deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
