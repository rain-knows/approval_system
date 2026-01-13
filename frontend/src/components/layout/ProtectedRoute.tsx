/**
 * 路由守卫组件
 *
 * 保护需要认证的路由，未登录用户将被重定向到登录页面。
 * 支持基于角色的权限控制。
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore, type User } from '@/stores/authStore'

/**
 * ProtectedRoute 组件属性
 */
interface ProtectedRouteProps {
    /** 允许访问的角色列表，不传则仅检查登录状态 */
    allowedRoles?: User['role'][]
    /** 未授权时的重定向路径，默认为 /login */
    redirectTo?: string
}

/**
 * 路由守卫组件
 *
 * [allowedRoles] 允许访问的角色列表
 * [redirectTo] 未授权时的重定向路径
 * 返回：子路由或重定向组件
 */
export default function ProtectedRoute({
    allowedRoles,
    redirectTo = '/login',
}: ProtectedRouteProps) {
    const location = useLocation()
    const { token, user } = useAuthStore()
    const isAuthenticated = !!token

    // 检查是否已登录
    if (!isAuthenticated) {
        // 保存当前路径，登录后可以跳转回来
        return <Navigate to={redirectTo} state={{ from: location }} replace />
    }

    // 检查角色权限（如果指定了 allowedRoles）
    if (allowedRoles && allowedRoles.length > 0) {
        const hasPermission = user && allowedRoles.includes(user.role)

        if (!hasPermission) {
            // 已登录但无权限，重定向到仪表盘
            return <Navigate to="/dashboard" replace />
        }
    }

    // 已认证且有权限，渲染子路由
    return <Outlet />
}

/**
 * 公开路由组件
 *
 * 用于登录页等公开页面，已登录用户将被重定向到仪表盘。
 */
export function PublicRoute() {
    const { token } = useAuthStore()
    const isAuthenticated = !!token

    // 已登录用户重定向到仪表盘
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
