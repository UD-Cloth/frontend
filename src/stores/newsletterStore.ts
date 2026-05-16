// Local-only store, kept for reference; backend-wired via useNewsletter hook
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Subscriber {
    id: string;
    email: string;
    subscribedAt: string;
    status: 'Subscribed' | 'Unsubscribed';
}

interface NewsletterStore {
    subscribers: Subscriber[];
    addSubscriber: (email: string) => boolean;
    removeSubscriber: (id: string) => void;
    toggleStatus: (id: string) => void;
}

export const useNewsletterStore = create<NewsletterStore>()(
    persist(
        (set, get) => ({
            subscribers: [
                {
                    id: 'sub-demo-1',
                    email: 'fashionfan@example.com',
                    subscribedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                    status: 'Subscribed'
                }
            ],
            
            addSubscriber: (email) => {
                const currentSubscribers = get().subscribers;
                // Prevent duplicate emails entirely
                if (currentSubscribers.some(sub => sub.email.toLowerCase() === email.toLowerCase())) {
                    // Handled: If they exist and are unsubscribed, we resubscribe them
                    const existing = currentSubscribers.find(sub => sub.email.toLowerCase() === email.toLowerCase());
                    if (existing && existing.status === 'Unsubscribed') {
                         set((state) => ({
                             subscribers: state.subscribers.map(sub => 
                                 sub.email === email ? { ...sub, status: 'Subscribed', subscribedAt: new Date().toISOString() } : sub
                             )
                         }));
                         return true;
                    }
                    return false; // Actually a duplicate
                }

                set((state) => ({
                    subscribers: [
                        {
                            id: `sub-${Date.now()}`,
                            email: email.toLowerCase(),
                            subscribedAt: new Date().toISOString(),
                            status: 'Subscribed'
                        },
                        ...state.subscribers
                    ]
                }));
                return true;
            },

            removeSubscriber: (id) => set((state) => ({
                subscribers: state.subscribers.filter(sub => sub.id !== id)
            })),

            toggleStatus: (id) => set((state) => ({
                subscribers: state.subscribers.map(sub =>
                    sub.id === id ? { ...sub, status: sub.status === 'Subscribed' ? 'Unsubscribed' : 'Subscribed' } : sub
                )
            }))
        }),
        {
            name: 'admin-newsletter-storage',
            version: 1,
        }
    )
);
