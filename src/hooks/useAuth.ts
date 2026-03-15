import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  token?: string;
  phone?: string;
}

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<User>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const { data } = await api.post<User>('/auth/register', userData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/auth/dashboard');
      return data;
    },
    staleTime: 5 * 60 * 1000, 
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
    }) => {
      const { data } = await api.put('/auth/profile', profileData);
      return data;
    },
    onSuccess: (data) => {
      // Update local storage to keep it in sync
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        try {
            const userInfo = JSON.parse(userInfoStr);
            if (typeof userInfo === 'object' && userInfo !== null) {
              localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...data }));
            } else {
              localStorage.setItem('userInfo', JSON.stringify(data));
            }
        } catch {
            localStorage.setItem('userInfo', JSON.stringify(data));
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
