/**
 * 审批列表页面组件
 *
 * 展示审批记录列表，支持状态筛选和搜索。
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'

/**
 * 审批状态类型
 */
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'all'

/**
 * 审批项类型
 */
interface ApprovalItem {
    id: string
    title: string
    type: string
    applicant: string
    applicantAvatar?: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
    description: string
}

// 模拟审批数据
const mockApprovals: ApprovalItem[] = [
    {
        id: '1',
        title: '年假申请 - 5天',
        type: '请假',
        applicant: '张三',
        status: 'pending',
        createdAt: '2026-01-13 09:30',
        description: '因个人事务需要请假5天',
    },
    {
        id: '2',
        title: '差旅报销 - ¥3,500',
        type: '报销',
        applicant: '李四',
        status: 'pending',
        createdAt: '2026-01-12 14:20',
        description: '上海出差交通和住宿费用报销',
    },
    {
        id: '3',
        title: '采购申请 - 办公设备',
        type: '采购',
        applicant: '王五',
        status: 'approved',
        createdAt: '2026-01-11 10:00',
        description: '申请采购10台笔记本电脑',
    },
    {
        id: '4',
        title: '加班申请 - 周末',
        type: '加班',
        applicant: '赵六',
        status: 'rejected',
        createdAt: '2026-01-10 16:45',
        description: '项目紧急需要周末加班',
    },
    {
        id: '5',
        title: '会议室预定 - 大会议室',
        type: '预定',
        applicant: '钱七',
        status: 'approved',
        createdAt: '2026-01-09 11:30',
        description: '预定大会议室进行季度总结会议',
    },
]

/**
 * 获取状态标签样式
 *
 * [status] 审批状态
 * 返回：对应的样式类名和文本
 */
function getStatusBadge(status: ApprovalItem['status']) {
    const styles = {
        pending: {
            className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            text: '待审批',
        },
        approved: {
            className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            text: '已通过',
        },
        rejected: {
            className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            text: '已拒绝',
        },
    }
    return styles[status]
}

/**
 * 审批列表页面
 *
 * 返回：审批列表页面组件
 */
export default function ApprovalListPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    // 筛选状态
    const [filter, setFilter] = useState<ApprovalStatus>('all')
    const [searchQuery, setSearchQuery] = useState('')

    /**
     * 处理登出操作
     */
    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // 过滤审批列表
    const filteredApprovals = mockApprovals.filter((item) => {
        const matchesFilter = filter === 'all' || item.status === filter
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.type.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    // 筛选按钮列表
    const filterButtons: { label: string; value: ApprovalStatus }[] = [
        { label: '全部', value: 'all' },
        { label: '待审批', value: 'pending' },
        { label: '已通过', value: 'approved' },
        { label: '已拒绝', value: 'rejected' },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* 顶部导航栏 */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/dashboard')}
                            >
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                返回
                            </Button>
                            <div className="h-6 w-px bg-border" />
                            <span className="text-lg font-semibold">审批列表</span>
                        </div>

                        {/* 用户信息和操作 */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                                欢迎，<span className="font-medium text-foreground">{user?.username}</span>
                            </span>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                退出
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 主内容区 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 搜索和筛选栏 */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* 搜索框 */}
                    <div className="relative flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <Input
                            placeholder="搜索审批标题、申请人或类型..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* 筛选按钮组 */}
                    <div className="flex gap-2">
                        {filterButtons.map((btn) => (
                            <Button
                                key={btn.value}
                                variant={filter === btn.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(btn.value)}
                            >
                                {btn.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* 审批列表 */}
                <div className="space-y-4">
                    {filteredApprovals.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <svg
                                    className="w-12 h-12 mx-auto text-muted-foreground mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <p className="text-muted-foreground">暂无符合条件的审批记录</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredApprovals.map((item) => {
                            const badge = getStatusBadge(item.status)
                            return (
                                <Card
                                    key={item.id}
                                    className="hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/approval/${item.id}`)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-secondary text-secondary-foreground">
                                                        {item.type}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${badge.className}`}>
                                                        {badge.text}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-lg">{item.title}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    {item.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                    {item.applicant.charAt(0)}
                                                </div>
                                                <span>{item.applicant}</span>
                                            </div>
                                            <span>{item.createdAt}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>

                {/* 分页（简化版） */}
                {filteredApprovals.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled>
                                上一页
                            </Button>
                            <span className="px-3 py-1 text-sm">第 1 页，共 1 页</span>
                            <Button variant="outline" size="sm" disabled>
                                下一页
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
