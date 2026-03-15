import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface OrderItem {
    id: string; // product id
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image: string;
}

export interface Order {
    id: string;
    customerId?: string; // Optional for guest checkout
    customerName: string;
    email: string;
    phone: string;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    createdAt: string;
}

interface OrderStore {
    orders: Order[];
    placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'orderStatus'>) => void;
    updateOrderStatus: (id: string, status: OrderStatus) => void;
    updatePaymentStatus: (id: string, status: PaymentStatus) => void;
    deleteOrder: (id: string) => void;
}

// Initial mock orders for the admin dashboard
const initialOrders: Order[] = [
    {
        id: "ORD-7392",
        customerName: "Rahul Sharma",
        email: "rahul.s@example.com",
        phone: "+91 9876543210",
        shippingAddress: {
            firstName: "Rahul",
            lastName: "Sharma",
            email: "rahul.s@example.com",
            phone: "+91 9876543210",
            address: "123 Main Street, Appt 4B",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400001",
        },
        items: [
            {
                id: "1",
                name: "Classic Cotton Crew Neck T-Shirt",
                price: 799,
                quantity: 2,
                size: "L",
                color: "Black",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"
            }
        ],
        totalAmount: 1598,
        paymentMethod: "Razorpay (UPI)",
        paymentStatus: "Paid",
        orderStatus: "Processing",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
    {
        id: "ORD-8451",
        customerName: "Priya Desai",
        email: "priya.d@example.com",
        phone: "+91 9123456780",
        shippingAddress: {
            firstName: "Priya",
            lastName: "Desai",
            email: "priya.d@example.com",
            phone: "+91 9123456780",
            address: "45 Park Avenue, 2nd Floor",
            city: "Bangalore",
            state: "Karnataka",
            zipCode: "560001",
        },
        items: [
            {
                id: "2",
                name: "Slim Fit Oxford Shirt",
                price: 1499,
                quantity: 1,
                size: "M",
                color: "Light Blue",
                image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop"
            },
            {
                id: "7",
                name: "Leather Belt",
                price: 699,
                quantity: 1,
                size: "M",
                color: "Brown",
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop"
            }
        ],
        totalAmount: 2198,
        paymentMethod: "Credit Card",
        paymentStatus: "Paid",
        orderStatus: "Shipped",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    },
    {
        id: "ORD-9123",
        customerName: "Amit Verma",
        email: "amit.v@example.com",
        phone: "+91 9988776655",
        shippingAddress: {
            firstName: "Amit",
            lastName: "Verma",
            email: "amit.v@example.com",
            phone: "+91 9988776655",
            address: "78 Residency Road",
            city: "Delhi",
            state: "Delhi",
            zipCode: "110001",
        },
        items: [
            {
                id: "4",
                name: "Classic Denim Jacket",
                price: 2499,
                quantity: 1,
                size: "L",
                color: "Blue",
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop"
            }
        ],
        totalAmount: 2499,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
        orderStatus: "Pending",
        createdAt: new Date().toISOString(), // Today
    }
];

export const useOrderStore = create<OrderStore>()(
    persist(
        (set) => ({
            orders: initialOrders,
            placeOrder: (orderData) => set((state) => {
                const newOrder: Order = {
                    ...orderData,
                    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                    orderStatus: 'Pending',
                    createdAt: new Date().toISOString(),
                };
                return { orders: [newOrder, ...state.orders] };
            }),
            updateOrderStatus: (id, status) => set((state) => ({
                orders: state.orders.map(order =>
                    order.id === id ? { ...order, orderStatus: status } : order
                )
            })),
            updatePaymentStatus: (id, status) => set((state) => ({
                orders: state.orders.map(order =>
                    order.id === id ? { ...order, paymentStatus: status } : order
                )
            })),
            deleteOrder: (id) => set((state) => ({
                orders: state.orders.filter(order => order.id !== id)
            }))
        }),
        {
            name: 'urban-drape-orders',
            version: 1,
        }
    )
);
