/**
 * 审批列表页面组件
 *
 * 展示审批记录列表，支持状态筛选和搜索。
 */

import { useState, useEffect } from 'react'
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
import { getMyApprovals, getStatusBadge, type ApprovalRecord } from '@/services/approvalService'

/**
 * 审批状态类型
 */
type ApprovalStatus = 'all' | '0' | '1' | '2' | '3' | '4' | '5'

/**
 * 审批列表页面
 *
 * 返回：审批列表页面组件
 */
export default function ApprovalListPage() {
    const navigate = useNavigate()

    // 状态
    const [approvals, setApprovals] = useState<ApprovalRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<ApprovalStatus>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // 分页
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // 加载数据
    useEffect(() => {
        const loadApprovals = async () => {
            setLoading(true)
            try {
                // 将 filter 转换为 API 需要的参数
                const statusParam = filter === 'all' ? undefined : parseInt(filter)
                const data = await getMyApprovals(page, pageSize, statusParam)

                setApprovals(data.list)
                setTotal(data.total)
                setTotalPages(data.totalPages)
            } catch (error) {
                console.error('加载审批列表失败:', error)
            } finally {
                setLoading(false)
            }
        }
        loadApprovals()
    }, [page, pageSize, filter])

    // 处理筛选变更
    const handleFilterChange = (newFilter: ApprovalStatus) => {
        setFilter(newFilter)
        setPage(1) // 重置页码
    }

    // 筛选按钮列表
    const filterButtons: { label: string; value: ApprovalStatus }[] = [
        { label: '全部', value: 'all' },
        { label: '待审批', value: '1' },
        { label: '审批中', value: '2' },
        { label: '已通过', value: '3' },
        { label: '已拒绝', value: '4' },
    ]

    // 前端搜索过滤（目前API暂未提供搜索，待后续完善）
    const displayedApprovals = approvals.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.typeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.typeName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background">
            {/* 主内容区 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">我的申请</h1>
                    <Button onClick={() => navigate('/approval/new')}>
                        发起审批
                    </Button>
                </div>

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
                            placeholder="搜索审批标题或类型..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* 筛选按钮组 */}
                    <div className="flex gap-2 flex-wrap">
                        {filterButtons.map((btn) => (
                            <Button
                                key={btn.value}
                                variant={filter === btn.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleFilterChange(btn.value)}
                            >
                                {btn.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* 审批列表 */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="pb-2">
                                    <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-4 bg-muted rounded w-full"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedApprovals.length === 0 ? (
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
                            displayedApprovals.map((item) => {
                                const badge = getStatusBadge(item.status)
                                return (
                                    <Card
                                        key={item.id}
                                        className="hover:shadow-md transition-shadow cursor-pointer group"
                                        onClick={() => navigate(`/approval/${item.id}`)}
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-secondary text-secondary-foreground"
                                                            style={{ backgroundColor: item.typeColor ? `${item.typeColor}20` : undefined, color: item.typeColor }}
                                                        >
                                                            {item.typeName}
                                                        </span>
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${badge.className}`}>
                                                            {badge.text}
                                                        </span>
                                                        {item.priority && item.priority > 0 && (
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${item.priority === 2 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                                {item.priority === 2 ? '非常紧急' : '紧急'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{item.title}</CardTitle>
                                                    <CardDescription className="mt-1 line-clamp-2">
                                                        {item.content && (() => {
                                                            try {
                                                                const content = JSON.parse(item.content)
                                                                if (item.typeCode === 'LEAVE') {
                                                                    return `理由: ${content.reason} (${content.days}天)`
                                                                } else if (item.typeCode === 'EXPENSE') {
                                                                    return `备注: ${content.remark || '无'} (总额: ¥${content.totalAmount})`
                                                                } else {
                                                                    return content.content || item.content
                                                                }
                                                            } catch (e) {
                                                                return item.content
                                                            }
                                                        })()}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                        {item.initiatorName?.charAt(0) || '我'}
                                                    </div>
                                                    <span>{item.initiatorName}</span>
                                                </div>
                                                <span>{new Date(item.createdAt).toLocaleString()}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                )}

                {/* 分页 */}
                {total > pageSize && (
                    <div className="flex justify-center mt-8 space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            上一页
                        </Button>
                        <span className="flex items-center px-3 text-sm text-muted-foreground">
                            第 {page} 页，共 {totalPages} 页
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            下一页
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}
