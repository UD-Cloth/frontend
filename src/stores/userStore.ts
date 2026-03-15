import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'Admin' | 'User';
    status: 'Active' | 'Blocked';
    joinedDate: string;
    orders: number;
}

interface UserStore {
    users: User[];
    updateUserStatus: (id: string, status: 'Active' | 'Blocked') => void;
    updateUserRole: (id: string, role: 'Admin' | 'User') => void;
    deleteUser: (id: string) => void;
}

// Mock initial data
const initialUsers: User[] = [
    {
        id: '1',
        firstName: 'Hardik',
        lastName: 'Admin',
        email: 'admin@urbanstyle.com',
        role: 'Admin',
        status: 'Active',
        joinedDate: '2023-10-15T10:00:00Z',
        orders: 0,
    },
    {
        id: '2',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'User',
        status: 'Active',
        joinedDate: '2024-01-20T14:30:00Z',
        orders: 5,
    },
    {
        id: '3',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'User',
        status: 'Blocked',
        joinedDate: '2023-11-05T09:15:00Z',
        orders: 2,
    }
];

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            users: initialUsers,

            updateUserStatus: (id, status) => set((state) => ({
                users: state.users.map(user =>
                    user.id === id ? { ...user, status } : user
                )
            })),

            updateUserRole: (id, role) => set((state) => ({
                users: state.users.map(user =>
                    user.id === id ? { ...user, role } : user
                )
            })),

            deleteUser: (id) => set((state) => ({
                users: state.users.filter(user => user.id !== id)
            })),
        }),
        {
            name: 'admin-users-storage',
            version: 1,
        }
    )
);
