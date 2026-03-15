import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    rating: number; // 1-5
}

interface CmsStore {
    heroSlides: HeroSlide[];
    promoBanner: PromoBannerContent;
    testimonials: Testimonial[];

    // Actions
    addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
    updateHeroSlide: (id: string, slide: Partial<HeroSlide>) => void;
    deleteHeroSlide: (id: string) => void;

    updatePromoBanner: (promo: Partial<PromoBannerContent>) => void;

    addTestimonial: (t: Omit<Testimonial, 'id'>) => void;
    deleteTestimonial: (id: string) => void;
}

const defaultSlides: HeroSlide[] = [
    {
        id: '1',
        image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=600&fit=crop",
        title: "New Season Collection",
        subtitle: "Discover the latest trends in men's fashion",
        cta: "Shop Now",
        link: "/new-arrivals",
    },
    {
        id: '2',
        image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&h=600&fit=crop",
        title: "Up to 50% Off",
        subtitle: "Limited time sale on premium apparel",
        cta: "Shop Sale",
        link: "/sale",
    }
];

export const useCmsStore = create<CmsStore>()(
    persist(
        (set) => ({
            heroSlides: defaultSlides,
            promoBanner: {
                isActive: true,
                text: "Trending This Season - Explore our curated collection of premium men's fashion",
                bgColor: "#ea384c", // primary color red
                textColor: "#ffffff",
                link: "/trending"
            },
            testimonials: [],

            addHeroSlide: (slide) => set((state) => ({
                heroSlides: [...state.heroSlides, { ...slide, id: crypto.randomUUID() }]
            })),

            updateHeroSlide: (id, updatedSlide) => set((state) => ({
                heroSlides: state.heroSlides.map(slide =>
                    slide.id === id ? { ...slide, ...updatedSlide } : slide
                )
            })),

            deleteHeroSlide: (id) => set((state) => ({
                heroSlides: state.heroSlides.filter(slide => slide.id !== id)
            })),

            updatePromoBanner: (promo) => set((state) => ({
                promoBanner: { ...state.promoBanner, ...promo }
            })),

            addTestimonial: (t) => set((state) => ({
                testimonials: [...state.testimonials, { ...t, id: crypto.randomUUID() }]
            })),

            deleteTestimonial: (id) => set((state) => ({
                testimonials: state.testimonials.filter(t => t.id !== id)
            }))
        }),
        {
            name: 'admin-cms-storage',
            version: 1,
        }
    )
);
