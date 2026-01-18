/**
 * 应用根组件
 *
 * 配置路由和路由守卫
 */

import { Routes, Route } from 'react-router-dom'
import ProtectedRoute, { PublicRoute } from '@/components/layout/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ApprovalListPage from '@/pages/approval/ApprovalListPage'
import ApprovalCreatePage from '@/pages/approval/ApprovalCreatePage'
import ApprovalDetailPage from '@/pages/approval/ApprovalDetailPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import MemberManagementPage from '@/pages/admin/MemberManagementPage'
import WorkflowConfigPage from '@/pages/admin/WorkflowConfigPage'
import DepartmentManagementPage from '@/pages/admin/DepartmentManagementPage'
import ApprovalTypeManagementPage from '@/pages/admin/ApprovalTypeManagementPage'
import OperationLogPage from '@/pages/admin/OperationLogPage'
import { Toaster } from '@/components/ui/sonner'

/**
 * 应用根组件
 *
 * 返回：应用路由配置
 */
function App() {
  return (
    <>
      <Routes>
        {/* 公开路由 - 已登录用户会被重定向到仪表盘 */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* 受保护路由 - 需要登录 */}
        <Route element={<ProtectedRoute />}>
          {/* 使用 MainLayout 作为布局容器 */}
          <Route element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/approval" element={<ApprovalListPage />} />
            <Route path="/approval/new" element={<ApprovalCreatePage />} />
            <Route path="/approval/:id" element={<ApprovalDetailPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* 管理员路由 - 仅管理员和超级管理员可见 */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
              <Route path="/admin/users" element={<MemberManagementPage />} />
              <Route path="/admin/workflows" element={<WorkflowConfigPage />} />
              <Route path="/admin/departments" element={<DepartmentManagementPage />} />
              <Route path="/admin/approval-types" element={<ApprovalTypeManagementPage />} />
              <Route path="/admin/logs" element={<OperationLogPage />} />
            </Route>
          </Route>
        </Route>


        {/* 404 页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
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
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}

export default App
