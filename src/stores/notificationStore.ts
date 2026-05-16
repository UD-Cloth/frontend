import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderStatus } from './orderStore';
import { sendSMSNotification } from '@/services/smsService';
import { format } from 'date-fns';

export interface NotificationLog {
    id: string;
    orderId: string;
    recipientName: string;
    recipientEmail: string;
    recipientPhone: string;
    method: 'Email' | 'SMS' | 'Both';
    message: string;
    status: 'Sent' | 'Failed';
    sentAt: string;
    // Bug #45: track read state for "Mark all as read" + bell badge
    read: boolean;
}

interface NotificationStore {
    notifications: NotificationLog[];
    sendNotification: (order: Order, newStatus: OrderStatus) => Promise<boolean>;
    clearHistory: () => void;
    // Bug #45
    markAllAsRead: () => void;
    markAsRead: (id: string) => void;
    unreadCount: () => number;
}

const generateMessage = (order: Order, status: OrderStatus): string => {
    const productName = order.items.length > 0 ? order.items[0].name : "your items";
    const moreItemsText = order.items.length > 1 ? ` and ${order.items.length - 1} other item(s)` : "";

    switch (status) {
        case 'Processing':
            return `Hi ${order.customerName}, your order #${order.id} for ${productName}${moreItemsText} is now being processed! We will notify you once it ships.`;
        case 'Shipped':
            return `Good news! Your order #${order.id} has been shipped and is on the way. You will receive it soon. Thank you for shopping with us.`;
        case 'Out for Delivery':
            return `Get ready! Your order #${order.id} is out for delivery today. Please ensure someone is available at ${order.shippingAddress.address} to receive it.`;
        case 'Delivered':
            return `Your order #${order.id} has been successfully delivered! We hope you love your purchase.`;
        case 'Cancelled':
            return `We're sorry to inform you that your order #${order.id} has been cancelled. If you have any questions or feel this is an error, please contact support.`;
        default:
            return `Your order #${order.id} status has been updated to: ${status}.`;
    }
};

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set, get) => ({
            notifications: [],

            sendNotification: async (order, newStatus) => {
                // Ignore 'Pending' which is the default creation state, not an update worth notifying usually
                if (newStatus === 'Pending') return false;

                const message = generateMessage(order, newStatus);

                // Call the SMS service
                const smsSuccess = await sendSMSNotification(order.phone, message);

                // Simulate an API call delay for email/sms service
                await new Promise(resolve => setTimeout(resolve, 800));

                const newLog: NotificationLog = {
                    id: `NOTIF-${Math.floor(100000 + Math.random() * 900000)}`,
                    orderId: order.id,
                    recipientName: order.customerName,
                    recipientEmail: order.email,
                    recipientPhone: order.phone,
                    method: 'Both', // In real app, check user DB preferences
                    message: message,
                    status: smsSuccess ? 'Sent' : 'Failed', // Status reflects simulated API response
                    sentAt: new Date().toISOString(),
                    read: false,
                };

                set((state) => ({
                    notifications: [newLog, ...state.notifications]
                }));

                return true;
            },

            clearHistory: () => set({ notifications: [] }),

            // Bug #45: mark all notifications as read
            markAllAsRead: () => set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, read: true })),
            })),

            markAsRead: (id) => set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, read: true } : n
                ),
            })),

            unreadCount: () => get().notifications.filter((n) => !n.read).length,
        }),
        {
            name: 'urban-drape-notifications',
            version: 2,
            // Migrate persisted notifications without `read` field to read: true
            // (treat existing history as already-seen on first load post-upgrade).
            migrate: (persistedState: any, version) => {
                if (!persistedState) return persistedState;
                if (version < 2 && Array.isArray(persistedState.notifications)) {
                    persistedState.notifications = persistedState.notifications.map(
                        (n: any) => ({ ...n, read: n.read ?? true })
                    );
                }
                return persistedState;
            },
        }
    )
);
