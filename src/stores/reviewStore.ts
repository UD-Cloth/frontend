// Local-only store, kept for reference; backend-wired via useAdminReviews hook
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewStore {
  reviews: Review[];
  isLoading: boolean;
  addReview: (review: Omit<Review, 'id' | 'date'>) => Promise<void>;
  getReviewsByProductId: (productId: string) => Review[];
  getAllReviews: () => Review[];
  deleteReview: (id: string) => Promise<void>;
}

// Initial demo reviews so the feature doesn't look empty immediately.
const DEMO_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'demo-1',
    userName: 'Alex Carter',
    rating: 5,
    comment: 'Absolutely love this shirt! The linen is so breathable and perfect for summer days. The fit is true to size.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
  },
  {
    id: 'rev-2',
    productId: 'demo-1',
    userName: 'Michael T.',
    rating: 4,
    comment: 'Great quality and style. It does wrinkle a bit quickly, but that is expected with linen. Overall very happy.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() // 12 days ago
  },
  {
    id: 'rev-3',
    productId: 'demo-2',
    userName: 'David R.',
    rating: 5,
    comment: 'Classic! The denim feels sturdy and the wash goes with everything. A must-have staple.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
  }
];

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      reviews: DEMO_REVIEWS,
      isLoading: false,

      addReview: async (review) => {
        set({ isLoading: true });
        try {
          // Simulate slight network delay
          await new Promise((resolve) => setTimeout(resolve, 600));

          const newReview: Review = {
            ...review,
            id: `rev-${Date.now()}`,
            date: new Date().toISOString(),
          };

          set((state) => ({ reviews: [newReview, ...state.reviews] }));
        } finally {
          set({ isLoading: false });
        }
      },

      getReviewsByProductId: (productId: string) => {
        return get().reviews.filter(r => r.productId === productId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getAllReviews: () => {
        return get().reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      deleteReview: async (id: string) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 400));
          set((state) => ({ reviews: state.reviews.filter(r => r.id !== id) }));
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'urban-drape-reviews-storage', 
    }
  )
);
