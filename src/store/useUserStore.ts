import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Aman', avatarUrl: 'https://i.pravatar.cc/150?u=Aman' },
  { id: 'u2', name: 'Rahul', avatarUrl: 'https://i.pravatar.cc/150?u=Rahul' },
  { id: 'u3', name: 'Priya', avatarUrl: 'https://i.pravatar.cc/150?u=Priya' },
  { id: 'u4', name: 'Neha', avatarUrl: 'https://i.pravatar.cc/150?u=Neha' },
  { id: 'u5', name: 'Vikas', avatarUrl: 'https://i.pravatar.cc/150?u=Vikas' },
];

interface UserState {
  users: User[];
  currentUser: User;
  setCurrentUser: (userId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: MOCK_USERS,
      currentUser: MOCK_USERS[0], // Default to Aman
      setCurrentUser: (userId) => set((state) => ({
        currentUser: state.users.find(u => u.id === userId) || state.currentUser
      })),
    }),
    {
      name: 'task-user-storage',
    }
  )
);
