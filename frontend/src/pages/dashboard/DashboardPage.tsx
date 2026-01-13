/**
 * 仪表盘页面组件
 *
 * 展示用户欢迎信息、待处理审批统计和快捷操作入口。
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'

/**
 * 统计卡片组件
 *
 * [title] 标题
 * [value] 数值
 * [description] 描述
 * [icon] 图标
 * [colorClass] 颜色类名
 */
interface StatCardProps {
    title: string
    value: string | number
    description: string
    icon: React.ReactNode
    colorClass: string
}

function StatCard({ title, value, description, icon, colorClass }: StatCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-md ${colorClass}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    )
}

/**
 * 仪表盘页面
 *
 * 返回：仪表盘页面组件
 */
export default function DashboardPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    /**
     * 处理登出操作
     */
    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // 模拟统计数据
    const stats = {
        pending: 5,
        approved: 12,
        rejected: 3,
        total: 20,
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 顶部导航栏 */}
            <header className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-primary-foreground"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <span className="text-lg font-semibold">审批系统</span>
                        </div>

                        {/* 用户信息和操作 */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                欢迎，<span className="font-medium text-foreground">{user?.username}</span>
                            </span>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                退出登录
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 主内容区 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 欢迎区域 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">控制台</h1>
                    <p className="text-muted-foreground mt-1">
                        查看和管理您的审批事项
                    </p>
                </div>

                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="待处理"
                        value={stats.pending}
                        description="需要您审批的事项"
                        colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="已通过"
                        value={stats.approved}
                        description="本月已通过审批"
                        colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="已拒绝"
                        value={stats.rejected}
                        description="本月已拒绝审批"
                        colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="总计"
                        value={stats.total}
                        description="本月总审批数量"
                        colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                    />
                </div>

                {/* 快捷操作 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>快捷操作</CardTitle>
                            <CardDescription>常用功能入口</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-20 flex flex-col gap-2"
                                onClick={() => navigate('/approval')}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                审批列表
                            </Button>
                            <Button
                                variant="outline"
                                className="h-20 flex flex-col gap-2"
                                onClick={() => navigate('/approval/new')}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                发起审批
                            </Button>
                            <Button
                                variant="outline"
                                className="h-20 flex flex-col gap-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                系统设置
                            </Button>
                            <Button
                                variant="outline"
                                className="h-20 flex flex-col gap-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                个人中心
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>最近活动</CardTitle>
                            <CardDescription>您的最新操作记录</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">审批通过 - 请假申请</p>
                                        <p className="text-xs text-muted-foreground">2 小时前</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">待审批 - 报销申请</p>
                                        <p className="text-xs text-muted-foreground">5 小时前</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">已提交 - 采购申请</p>
                                        <p className="text-xs text-muted-foreground">昨天</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
