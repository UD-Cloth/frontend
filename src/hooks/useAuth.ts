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

export interface ProfileResponse {
  profile: User & {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    // Sprint 7 / BUG-F-053: surface the fields the UI actually reads, so
    // call sites can drop the `as any` casts.
    emailVerified?: boolean;
    createdAt?: string;
  };
  orders: any[];
}

export const useProfile = () => {
  return useQuery<ProfileResponse>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<ProfileResponse>('/auth/dashboard');
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
      const { data } = await api.put<Record<string, unknown>>('/auth/profile', profileData);
      return data;
    },
    onSuccess: (data) => {
      // Sprint 4 / BUG-F-059: NEVER replace userInfo wholesale — backend
      // PUT /auth/profile does not echo the `token` field, so a wholesale
      // replace silently signs the user out on the very next API call.
      // Always merge into existing userInfo and preserve the token.
      try {
        const userInfoStr = localStorage.getItem('userInfo');
        const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
        if (userInfo && typeof userInfo === 'object' && data && typeof data === 'object') {
          const merged = { ...userInfo, ...data, token: userInfo.token };
          localStorage.setItem('userInfo', JSON.stringify(merged));
        }
        // If we can't parse userInfo we deliberately do NOTHING — better to
        // leave the existing entry alone than wipe the token.
      } catch {
        // ignore — preserve whatever was there
      }
      
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/auth/resend-verification', { email });
      return data;
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post('/auth/verify-email', { token });
      return data;
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const { data } = await api.post('/auth/reset-password', { token, newPassword });
      return data;
    },
  });
};
