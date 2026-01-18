/**
 * 审批列表页面组件
 *
 * 三栏式 Master-Detail：中间审批流列表 + 右侧详情与操作。
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
    approveApproval,
    getApprovalDetail,
    getMyApprovals,
    getStatusBadge,
    getTodoApprovals,
    withdrawApproval,
    type ApprovalRecord,
} from '@/services/approvalService'
import { formatFileSize, getFileDownloadUrl } from '@/services/fileService'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { CheckCircle2, ChevronRight, Clock, FileText, Inbox, User } from 'lucide-react'

/**
 * 审批状态类型
 */
type ApprovalStatus = 'all' | '0' | '1' | '2' | '3' | '4' | '5'

/**
 * Tab 类型
 */
type TabType = 'todo' | 'initiated' | 'done'

/**
 * 审批列表页面
 *
 * 返回：审批列表页面组件
 */
export default function ApprovalListPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user } = useAuthStore()

    // Tab 状态
    const [activeTab, setActiveTab] = useState<TabType>('initiated')

    // 状态
    const [approvals, setApprovals] = useState<ApprovalRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [detailLoading, setDetailLoading] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [selectedDetail, setSelectedDetail] = useState<ApprovalRecord | null>(null)
    const [filter, setFilter] = useState<ApprovalStatus>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // 审批操作
    const [actionDrawerOpen, setActionDrawerOpen] = useState(false)
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
    const [comment, setComment] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    // 待办数量
    const [todoCount, setTodoCount] = useState(0)

    // 分页
    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // 加载待办数量
    useEffect(() => {
        const loadTodoCount = async () => {
            try {
                const data = await getTodoApprovals(1, 1)
                setTodoCount(data.total)
            } catch (error) {
                console.error('加载待办数量失败:', error)
            }
        }
        loadTodoCount()
    }, [])

    useEffect(() => {
        const tabParam = searchParams.get('tab')
        if (tabParam === 'todo' || tabParam === 'initiated' || tabParam === 'done') {
            setActiveTab(tabParam)
        }
        const statusParam = searchParams.get('status') as ApprovalStatus | null
        if (statusParam && ['all', '0', '1', '2', '3', '4', '5'].includes(statusParam)) {
            setFilter(statusParam)
        }
        if (searchParams.has('query')) {
            setSearchQuery(searchParams.get('query') || '')
        }
    }, [searchParams])

    // 加载数据
    const loadApprovals = useCallback(async () => {
        setLoading(true)
        try {
            if (activeTab === 'todo') {
                const data = await getTodoApprovals(page, pageSize)
                setApprovals(data.list)
                setTotal(data.total)
                setTotalPages(data.totalPages)
            } else if (activeTab === 'done') {
                const data = await getMyApprovals(page, pageSize)
                const doneList = data.list.filter(item => [3, 4, 5].includes(item.status))
                setApprovals(doneList)
                setTotal(doneList.length)
                setTotalPages(Math.max(1, Math.ceil(doneList.length / pageSize)))
            } else {
                const statusParam = filter === 'all' ? undefined : parseInt(filter)
                const data = await getMyApprovals(page, pageSize, statusParam)
                setApprovals(data.list)
                setTotal(data.total)
                setTotalPages(data.totalPages)
            }
        } catch (error) {
            console.error('加载审批列表失败:', error)
        } finally {
            setLoading(false)
        }
    }, [activeTab, filter, page, pageSize])

    useEffect(() => {
        loadApprovals()
    }, [loadApprovals])

    useEffect(() => {
        if (approvals.length === 0) {
            setSelectedId(null)
            setSelectedDetail(null)
            return
        }
        if (!selectedId || !approvals.some(item => item.id === selectedId)) {
            setSelectedId(approvals[0].id)
        }
    }, [approvals, selectedId])

    useEffect(() => {
        if (!selectedId) return
        const loadDetail = async () => {
            setDetailLoading(true)
            try {
                const data = await getApprovalDetail(selectedId)
                setSelectedDetail(data)
            } catch (error) {
                console.error('加载审批详情失败:', error)
                toast.error('加载详情失败')
            } finally {
                setDetailLoading(false)
            }
        }
        loadDetail()
    }, [selectedId])

    // 处理 Tab 切换
    const handleTabChange = (value: string) => {
        setActiveTab(value as TabType)
        setPage(1)
        setFilter('all')
    }

    // 处理筛选变更
    const handleFilterChange = (newFilter: ApprovalStatus) => {
        setFilter(newFilter)
        setPage(1)
    }

    // 筛选按钮列表
    const filterButtons: { label: string; value: ApprovalStatus }[] = [
        { label: '全部', value: 'all' },
        { label: '待审批', value: '1' },
        { label: '审批中', value: '2' },
        { label: '已通过', value: '3' },
        { label: '已拒绝', value: '4' },
    ]

    // 前端搜索过滤
    const displayedApprovals = useMemo(() => {
        if (!searchQuery.trim()) return approvals
        const keyword = searchQuery.toLowerCase()
        return approvals.filter(item =>
            item.title.toLowerCase().includes(keyword) ||
            item.typeCode.toLowerCase().includes(keyword) ||
            item.typeName.toLowerCase().includes(keyword) ||
            item.initiatorName?.toLowerCase().includes(keyword)
        )
    }, [approvals, searchQuery])

    const presetReplies = ['同意', '资料不全', '请补充附件', '预算不足']

    const isCurrentApprover = useCallback((): boolean => {
        if (!selectedDetail || !user || !selectedDetail.nodes) return false
        if (selectedDetail.status !== 1 && selectedDetail.status !== 2) return false
        const currentNode = selectedDetail.nodes.find(
            node => node.nodeOrder === selectedDetail.currentNodeOrder && node.status === 0
        )
        return currentNode?.approverId === user.id
    }, [selectedDetail, user])

    const canWithdraw = useCallback((): boolean => {
        if (!selectedDetail || !user) return false
        if (selectedDetail.initiatorId !== user.id) return false
        return selectedDetail.status === 1 || selectedDetail.status === 2
    }, [selectedDetail, user])

    const handleApprove = async (approved: boolean) => {
        if (!selectedId) return
        setActionLoading(true)
        try {
            await approveApproval(selectedId, approved, comment)
            toast.success(approved ? '审批已通过' : '审批已拒绝')
            setComment('')
            setActionDrawerOpen(false)
            await loadApprovals()
            const updated = await getApprovalDetail(selectedId)
            setSelectedDetail(updated)
        } catch (error: any) {
            console.error('审批操作失败:', error)
            toast.error(error.response?.data?.message || '审批操作失败')
        } finally {
            setActionLoading(false)
        }
    }

    const handleWithdraw = async () => {
        if (!selectedId) return
        setActionLoading(true)
        try {
            await withdrawApproval(selectedId)
            toast.success('审批已撤回')
            await loadApprovals()
            const updated = await getApprovalDetail(selectedId)
            setSelectedDetail(updated)
        } catch (error: any) {
            console.error('撤回失败:', error)
            toast.error(error.response?.data?.message || '撤回失败')
        } finally {
            setActionLoading(false)
        }
    }

    const renderContent = () => {
        if (!selectedDetail?.content) return null

        try {
            const data = JSON.parse(selectedDetail.content)

            if (selectedDetail.typeCode === 'LEAVE') {
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-muted-foreground block">请假类型</span>
                                <span className="font-medium">{renderLeaveType(data.leaveType)}</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block">请假天数</span>
                                <span className="font-medium">{data.days} 天</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block">开始时间</span>
                                <span>{data.startDate}</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block">结束时间</span>
                                <span>{data.endDate}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground block mb-1">请假事由</span>
                            <div className="p-3 bg-muted/30 rounded-md">
                                {data.reason}
                            </div>
                        </div>
                    </div>
                )
            } else if (selectedDetail.typeCode === 'EXPENSE') {
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-muted-foreground block">报销类型</span>
                                <span className="font-medium">{renderExpenseType(data.expenseType)}</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground block">总金额</span>
                                <span className="font-medium text-lg text-primary">¥{data.totalAmount?.toFixed(2)}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground block mb-2">费用明细</span>
                            <div className="space-y-2">
                                {data.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                                        <span>{item.type} - {item.description}</span>
                                        <span className="font-medium">¥{item.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {data.remark && (
                            <div>
                                <span className="text-sm text-muted-foreground block mb-1">备注</span>
                                <div className="p-3 bg-muted/30 rounded-md">
                                    {data.remark}
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

            return (
                <pre className="p-3 bg-muted/30 rounded-md overflow-auto text-sm">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )
        } catch {
            return <div>{selectedDetail.content}</div>
        }
    }

    const renderLeaveType = (type: string) => {
        const types: Record<string, string> = {
            annual: '年假', sick: '病假', personal: '事假',
            marriage: '婚假', maternity: '产假', bereavement: '丧假'
        }
        return types[type] || type
    }

    const renderExpenseType = (type: string) => {
        const types: Record<string, string> = {
            travel: '差旅费', office: '办公费', entertainment: '招待费',
            training: '培训费', equipment: '设备费', other: '其他'
        }
        return types[type] || type
    }

    const renderNodeStatus = (status: number) => {
        switch (status) {
            case 0: return <Badge variant="outline">待审批</Badge>
            case 1: return <Badge variant="success">已通过</Badge>
            case 2: return <Badge variant="destructive">已拒绝</Badge>
            default: return <Badge variant="outline">未知</Badge>
        }
    }

    // 渲染审批卡片
    const renderApprovalItem = (item: ApprovalRecord) => {
        const badge = getStatusBadge(item.status)
        const isSelected = selectedId === item.id
        return (
            <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={cn(
                    'w-full text-left rounded-xl border px-3 py-3 transition-all',
                    isSelected
                        ? 'border-primary/40 bg-primary/10 shadow-sm'
                        : 'border-transparent bg-background/50 hover:bg-muted/50'
                )}
            >
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                                {item.title}
                            </span>
                            <span
                                className="px-2 py-0.5 text-[11px] font-medium rounded"
                                style={{ backgroundColor: item.typeColor ? `${item.typeColor}20` : undefined, color: item.typeColor }}
                            >
                                {item.typeName}
                            </span>
                            <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${badge.className}`}>
                                {badge.text}
                            </span>
                            {item.priority && item.priority > 0 && (
                                <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${item.priority === 2 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                    {item.priority === 2 ? '非常紧急' : '紧急'}
                                </span>
                            )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {item.initiatorName || '未知'}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(item.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition', isSelected && 'text-primary')} />
                </div>
            </button>
        )
    }

    return (
        <div className="h-[calc(100vh-4rem)]">
            <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-12">
                {/* 中间审批流列表 */}
                <section className="glass-card flex h-full flex-col gap-4 rounded-2xl p-4 xl:col-span-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">审批流</h2>
                            <p className="text-xs text-muted-foreground">集中处理与跟进</p>
                        </div>
                        <Button size="sm" onClick={() => navigate('/approval/new')}>
                            发起审批
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger value="todo" className="relative">
                                <span className="inline-flex items-center gap-2">
                                    <Inbox className="h-4 w-4" />
                                    待办
                                </span>
                                {todoCount > 0 && (
                                    <Badge variant="destructive" className="ml-2 h-5 px-1.5 min-w-5 text-xs">
                                        {todoCount > 99 ? '99+' : todoCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="initiated">我发起的</TabsTrigger>
                            <TabsTrigger value="done" className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                已办
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="space-y-4">
                            <div className="relative">
                                <Input
                                    placeholder="搜索审批标题、类型或申请人..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {activeTab === 'initiated' && (
                                <div className="flex flex-wrap gap-2">
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
                            )}
                        </TabsContent>
                    </Tabs>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
                                ))}
                            </div>
                        ) : displayedApprovals.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-muted/60 p-6 text-center text-sm text-muted-foreground">
                                {activeTab === 'todo' ? '暂无待办审批' : '暂无符合条件的审批记录'}
                            </div>
                        ) : (
                            displayedApprovals.map(renderApprovalItem)
                        )}
                    </div>

                    {total > pageSize && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                上一页
                            </Button>
                            <span>第 {page} 页，共 {totalPages} 页</span>
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
                </section>

                {/* 右侧详情与操作区 */}
                <section className="flex h-full flex-col gap-4 xl:col-span-8">
                    <Card className="glass-card flex min-h-0 flex-1 flex-col rounded-2xl border-0">
                        <CardHeader className="border-b border-border/60">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl">
                                        {selectedDetail ? selectedDetail.title : '选择一条审批查看详情'}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {selectedDetail ? `发起时间: ${new Date(selectedDetail.createdAt).toLocaleString()}` : '右侧区域展示详细信息与操作'}
                                    </CardDescription>
                                </div>
                                {selectedDetail && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className="px-2 py-0.5 text-xs font-medium rounded"
                                            style={{ backgroundColor: selectedDetail.typeColor ? `${selectedDetail.typeColor}20` : undefined, color: selectedDetail.typeColor }}
                                        >
                                            {selectedDetail.typeName}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusBadge(selectedDetail.status).className}`}>
                                            {getStatusBadge(selectedDetail.status).text}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-6">
                            {detailLoading ? (
                                <div className="space-y-4">
                                    <div className="h-20 rounded bg-muted/50 animate-pulse" />
                                    <div className="h-40 rounded bg-muted/50 animate-pulse" />
                                </div>
                            ) : selectedDetail ? (
                                <div className="space-y-6">
                                    {renderContent()}

                                    {selectedDetail.attachments && selectedDetail.attachments.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">附件</h3>
                                            <div className="space-y-2">
                                                {selectedDetail.attachments.map(file => (
                                                    <div key={file.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                <FileText className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">{file.fileName}</div>
                                                                <div className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(getFileDownloadUrl(file.fileUrl), '_blank')}
                                                        >
                                                            下载
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    请选择左侧审批记录以查看详情
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <Card className="glass-card rounded-2xl border-0 xl:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base">审批流程</CardTitle>
                                <CardDescription>节点进度与意见</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedDetail?.nodes && selectedDetail.nodes.length > 0 ? (
                                    <div className="relative space-y-6 border-l border-muted/70 pl-5">
                                        <div className="relative">
                                            <div className="absolute -left-2.25 top-1 h-3 w-3 rounded-full bg-green-500 ring-4 ring-background" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">发起申请</p>
                                                <p className="text-xs text-muted-foreground">{new Date(selectedDetail.createdAt).toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">{selectedDetail.initiatorName}</p>
                                            </div>
                                        </div>
                                        {selectedDetail.nodes.map((node) => (
                                            <div key={node.id} className="relative">
                                                <div className={`absolute -left-2.25 top-1 h-3 w-3 rounded-full ring-4 ring-background ${node.status === 1 ? 'bg-green-500' : node.status === 2 ? 'bg-red-500' : 'bg-yellow-400'}`} />
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium">{node.nodeName}</p>
                                                        {renderNodeStatus(node.status)}
                                                    </div>
                                                    {node.approvedAt && (
                                                        <p className="text-xs text-muted-foreground">{new Date(node.approvedAt).toLocaleString()}</p>
                                                    )}
                                                    {node.comment && (
                                                        <p className="text-xs bg-muted/50 p-2 rounded mt-1">“{node.comment}”</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">暂无流程信息</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="glass-card rounded-2xl border-0">
                            <CardHeader>
                                <CardTitle className="text-base">操作区</CardTitle>
                                <CardDescription>快速审批与动作</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {isCurrentApprover() ? (
                                    <div className="space-y-2">
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            onClick={() => {
                                                setActionType('approve')
                                                setActionDrawerOpen(true)
                                            }}
                                            disabled={actionLoading}
                                        >
                                            通过
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="w-full"
                                            onClick={() => {
                                                setActionType('reject')
                                                setActionDrawerOpen(true)
                                            }}
                                            disabled={actionLoading}
                                        >
                                            驳回
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-muted/60 p-3 text-xs text-muted-foreground">
                                        当前无可审批事项
                                    </div>
                                )}

                                {canWithdraw() && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleWithdraw}
                                        disabled={actionLoading}
                                    >
                                        撤回申请
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>

            <Sheet open={actionDrawerOpen} onOpenChange={setActionDrawerOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{actionType === 'approve' ? '通过审批' : '驳回审批'}</SheetTitle>
                        <SheetDescription>填写审批意见，支持快捷回复</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 px-4">
                        <div className="flex flex-wrap gap-2">
                            {presetReplies.map((reply) => (
                                <Button
                                    key={reply}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setComment(reply)}
                                >
                                    {reply}
                                </Button>
                            ))}
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">审批意见（可选）</label>
                            <Textarea
                                placeholder="请输入审批意见..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={5}
                            />
                        </div>
                    </div>
                    <SheetFooter className="px-4">
                        <Button
                            variant="outline"
                            onClick={() => setActionDrawerOpen(false)}
                        >
                            取消
                        </Button>
                        <Button
                            onClick={() => handleApprove(actionType === 'approve')}
                            disabled={actionLoading}
                            className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            {actionLoading ? '处理中...' : actionType === 'approve' ? '确认通过' : '确认驳回'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}
