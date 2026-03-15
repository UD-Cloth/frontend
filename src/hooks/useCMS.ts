import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
}

export interface PromoBannerContent {
  isActive: boolean;
  text: string;
  bgColor: string;
  textColor: string;
  link: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface CMSData {
  heroSlides: HeroSlide[];
  promoBanner: PromoBannerContent;
  testimonials: Testimonial[];
}

export function useCMSData() {
  return useQuery<CMSData>({
    queryKey: ['cmsData'],
    queryFn: async () => {
      const { data } = await api.get<CMSData>('/cms');
      return data;
    },
  });
}

export function useUpdateHeroSlides() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slides: HeroSlide[]) => {
      const { data } = await api.put<CMSData>('/cms/hero', { slides });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cmsData'] });
    },
  });
}

export function useUpdatePromoBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promo: PromoBannerContent) => {
      const { data } = await api.put<CMSData>('/cms/promo', promo);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cmsData'] });
    },
  });
}

export function useUpdateTestimonials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testimonials: Testimonial[]) => {
      const { data } = await api.put<CMSData>('/cms/testimonials', { testimonials });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cmsData'] });
    },
  });
}
