import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService, { type LoginResponse, type RegisterParams } from '@/services/authService'

/**
 * 用户信息类型
 */
export interface User {
    /** 用户ID */
    id: number
    /** 用户名 */
    username: string
    /** 昵称 */
    nickname: string
    /** 邮箱 */
    email?: string
    /** 头像 */
    avatar?: string
    /** 角色列表 */
    roles: string[]
    /** 主要角色（用于路由权限判断） */
    role: 'user' | 'admin' | 'superadmin'
}

/**
 * 认证状态接口
 */
interface AuthState {
    /** 当前用户 */
    user: User | null
    /** JWT Token */
    token: string | null
    /** 登录 */
    login: (username: string, password: string) => Promise<void>
    /** 登出 */
    logout: () => void
    /** 注册 */
    register: (params: RegisterParams) => Promise<void>
    /** 直接设置认证信息（供内部使用） */
    setAuth: (user: User, token: string) => void
}

/**
 * 将后端角色编码转换为前端角色类型
 *
 * [roles] 后端角色编码列表
 * 返回：前端角色类型
 */
function mapRole(roles: string[]): 'user' | 'admin' | 'superadmin' {
    if (roles.includes('SUPER_ADMIN')) {
        return 'superadmin'
    }
    if (roles.includes('ADMIN')) {
        return 'admin'
    }
    return 'user'
}

/**
 * 将登录响应转换为 User 对象
 *
 * [response] 登录响应
 * 返回：User 对象
 */
function mapLoginResponseToUser(response: LoginResponse): User {
    if (!response || !response.user) {
        throw new Error('登录响应数据格式错误：缺少用户信息')
    }
    const { user } = response
    return {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        roles: user.roles || [],
        role: mapRole(user.roles || []),
    }
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,

            /**
             * 用户登录
             *
             * [username] 用户名
             * [password] 密码
             */
            login: async (username: string, password: string) => {
                const response = await authService.login({ username, password })
                if (!response) {
                    throw new Error('服务器未返回数据')
                }
                const user = mapLoginResponseToUser(response)
                set({ user, token: response.token })
            },

            /**
             * 用户登出
             */
            logout: () => set({ user: null, token: null }),

            /**
             * 用户注册
             *
             * [params] 注册参数
             */
            register: async (params: RegisterParams) => {
                await authService.register(params)
            },

            /**
             * 设置认证信息
             *
             * [user] 用户信息
             * [token] JWT Token
             */
            setAuth: (user: User, token: string) => set({ user, token }),
        }),
        { name: 'auth-storage' }
    )
)

