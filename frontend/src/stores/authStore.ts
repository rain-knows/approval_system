import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
    username: string
    email?: string
    role: 'user' | 'admin' | 'superadmin'
}

interface AuthState {
    user: User | null
    token: string | null
    login: (user: User, token: string) => void
    logout: () => void
    register: (username: string, password: string, email: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            login: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
            register: async (username, password, email) => {
                // Mock register implementation
                console.log('Registering:', { username, email, password })
                return Promise.resolve()
            }
        }),
        { name: 'auth-storage' }
    )
)
