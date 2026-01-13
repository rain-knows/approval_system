/**
 * 应用根组件
 *
 * 配置路由和路由守卫
 */

import { Routes, Route } from 'react-router-dom'
import ProtectedRoute, { PublicRoute } from '@/components/layout/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ApprovalListPage from '@/pages/approval/ApprovalListPage'

/**
 * 应用根组件
 *
 * 返回：应用路由配置
 */
function App() {
  return (
    <Routes>
      {/* 公开路由 - 已登录用户会被重定向到仪表盘 */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        {/* 后续可添加注册页面 */}
        {/* <Route path="/register" element={<RegisterPage />} /> */}
      </Route>

      {/* 受保护路由 - 需要登录 */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/approval" element={<ApprovalListPage />} />
        {/* 后续可添加更多受保护页面 */}
        {/* <Route path="/approval/:id" element={<ApprovalDetailPage />} /> */}
        {/* <Route path="/approval/new" element={<ApprovalCreatePage />} /> */}
      </Route>

      {/* 管理员路由 - 需要 admin 或 superadmin 角色 */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
        {/* <Route path="/admin" element={<AdminPage />} /> */}
        {/* <Route path="/settings" element={<SettingsPage />} /> */}
      </Route>

      {/* 默认重定向到仪表盘 */}
      <Route path="/" element={<DashboardPage />} />

      {/* 404 页面 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

/**
 * 404 页面组件
 *
 * 返回：404 错误页面
 */
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">页面未找到</p>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}

export default App
