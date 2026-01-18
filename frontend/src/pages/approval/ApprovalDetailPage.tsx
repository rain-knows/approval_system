/**
 * 审批详情页面组件
 *
 * 展示审批详情，支持审批操作（通过/拒绝）和撤回。
 */

import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { PageContainer } from '@/components/layout/PageContainer'
import {
    getApprovalDetail,
    getStatusBadge,
    approveApproval,
    withdrawApproval,
    type ApprovalRecord
} from '@/services/approvalService'
import { getFileDownloadUrl, formatFileSize } from '@/services/fileService'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export default function ApprovalDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [record, setRecord] = useState<ApprovalRecord | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [comment, setComment] = useState('')

    /**
     * 加载审批详情
     */
    const loadDetail = useCallback(async () => {
        if (!id) return
        setLoading(true)
        try {
            const data = await getApprovalDetail(id)
            setRecord(data)
        } catch (error) {
            console.error('加载详情失败:', error)
            toast.error('无法获取审批详情')
        } finally {
            setLoading(false)
        }
    }, [id])

    // 加载详情
    useEffect(() => {
        loadDetail()
    }, [loadDetail])

    /**
     * 判断当前用户是否为当前节点的审批人
     */
    const isCurrentApprover = (): boolean => {
        if (!record || !user || !record.nodes) return false
        // 状态必须是待审批或审批中
        if (record.status !== 1 && record.status !== 2) return false
        // 查找当前节点
        const currentNode = record.nodes.find(
            node => node.nodeOrder === record.currentNodeOrder && node.status === 0
        )
        return currentNode?.approverId === user.id
    }

    /**
     * 判断当前用户是否可以撤回
     */
    const canWithdraw = (): boolean => {
        if (!record || !user) return false
        // 必须是发起人
        if (record.initiatorId !== user.id) return false
        // 状态必须是待审批或审批中
        return record.status === 1 || record.status === 2
    }

    /**
     * 处理审批操作
     */
    const handleApprove = async (approved: boolean) => {
        if (!id) return
        setActionLoading(true)
        try {
            await approveApproval(id, approved, comment)
            toast.success(approved ? '审批已通过' : '审批已拒绝')
            setComment('')
            await loadDetail() // 重新加载详情
        } catch (error: unknown) {
            console.error('审批操作失败:', error)
            const axiosError = error as { response?: { data?: { message?: string } } }
            toast.error(axiosError.response?.data?.message || '审批操作失败')
        } finally {
            setActionLoading(false)
        }
    }

    /**
     * 处理撤回
     */
    const handleWithdraw = async () => {
        if (!id) return
        setActionLoading(true)
        try {
            await withdrawApproval(id)
            toast.success('审批已撤回')
            await loadDetail()
        } catch (error: unknown) {
            console.error('撤回失败:', error)
            const axiosError = error as { response?: { data?: { message?: string } } }
            toast.error(axiosError.response?.data?.message || '撤回失败')
        } finally {
            setActionLoading(false)
        }
    }

    /**
     * 解析内容JSON
     */
    const renderContent = () => {
        if (!record?.content) return null

        try {
            const data = JSON.parse(record.content)

            if (record.typeCode === 'LEAVE') {
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
            } else if (record.typeCode === 'EXPENSE') {
                type ExpenseItem = {
                    type?: string
                    description?: string
                    amount?: number
                }
                const items = (data.items as ExpenseItem[] | undefined) ?? []
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
                                {items.map((item, idx) => (
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

            // 默认展示
            return (
                <pre className="p-3 bg-muted/30 rounded-md overflow-auto text-sm">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )
        } catch {
            return <div>{record.content}</div>
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

    /**
     * 渲染节点状态
     */
    const renderNodeStatus = (status: number) => {
        switch (status) {
            case 0: return <Badge variant="outline">待审批</Badge>
            case 1: return <Badge variant="success">已通过</Badge>
            case 2: return <Badge variant="destructive">已拒绝</Badge>
            default: return <Badge variant="outline">未知</Badge>
        }
    }

    if (loading) {
        return (
            <PageContainer title="加载中...">
                <div className="grid gap-6 lg:grid-cols-4 animate-pulse">
                    <div className="lg:col-span-3 space-y-6">
                        <div className="h-64 bg-muted rounded-lg"></div>
                    </div>
                </div>
            </PageContainer>
        )
    }

    if (!record) {
        return (
            <PageContainer title="未找到">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">审批记录不存在或已被删除</p>
                    <Button variant="link" onClick={() => navigate('/approval')}>返回列表</Button>
                </div>
            </PageContainer>
        )
    }

    const statusBadge = getStatusBadge(record.status)

    return (
        <PageContainer
            title={
                <div className="flex items-center gap-3">
                    <span>审批详情 #{record.id.substring(0, 8)}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusBadge.className}`}>
                        {statusBadge.text}
                    </span>
                </div>
            }
            description={`发起时间: ${new Date(record.createdAt).toLocaleString()} | 类型: ${record.typeName}`}
            action={
                <div className="flex gap-2">
                    {canWithdraw() && (
                        <Button
                            variant="outline"
                            onClick={handleWithdraw}
                            disabled={actionLoading}
                        >
                            撤回
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate('/approval')}>返回列表</Button>
                </div>
            }
        >
            <div className="grid gap-6 lg:grid-cols-4">
                {/* 左侧详情 */}
                <div className="lg:col-span-3 space-y-6">
                    {/* 申请内容 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>申请内容</CardTitle>
                            <CardDescription className="text-lg font-medium text-foreground mt-2">
                                {record.title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderContent()}
                        </CardContent>
                    </Card>

                    {/* 附件 */}
                    {record.attachments && record.attachments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>附件 ({record.attachments.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {record.attachments.map(file => (
                                        <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{file.fileName}</div>
                                                    <div className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {file.previewSupport && (
                                                    <Button variant="ghost" size="sm" onClick={() => window.open(getFileDownloadUrl(file.fileUrl), '_blank')}>预览</Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => window.open(getFileDownloadUrl(file.fileUrl), '_blank')}>下载</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 审批操作区域 */}
                    {isCurrentApprover() && (
                        <Card className="border-primary/50">
                            <CardHeader>
                                <CardTitle className="text-primary">审批操作</CardTitle>
                                <CardDescription>请填写审批意见并选择操作</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">审批意见（可选）</label>
                                    <Textarea
                                        placeholder="请输入审批意见..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handleApprove(true)}
                                        disabled={actionLoading}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        通过
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleApprove(false)}
                                        disabled={actionLoading}
                                        className="flex-1"
                                    >
                                        拒绝
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* 右侧流程 */}
                <div className="lg:col-span-1 space-y-6">
                    {/* 发起人信息 */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">发起人</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {record.initiatorName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="font-medium">{record.initiatorName}</div>
                                    <div className="text-xs text-muted-foreground">申请人</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 审批流程 */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">审批流程</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-4 border-l-2 border-muted space-y-8 py-2">
                                {/* 发起节点 */}
                                <div className="relative">
                                    <div className="absolute -left-5.25 top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-background" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">发起申请</p>
                                        <p className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">{record.initiatorName}</p>
                                    </div>
                                </div>

                                {/* 审批节点 */}
                                {record.nodes?.map((node) => (
                                    <div key={node.id} className="relative">
                                        <div className={`absolute -left-5.25 top-1 w-3 h-3 rounded-full ring-4 ring-background ${node.status === 1 ? 'bg-green-500' :
                                            node.status === 2 ? 'bg-red-500' : 'bg-yellow-400'
                                            }`} />
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{node.nodeName}</p>
                                                {renderNodeStatus(node.status)}
                                            </div>
                                            {node.approvedAt && (
                                                <p className="text-xs text-muted-foreground">{new Date(node.approvedAt).toLocaleString()}</p>
                                            )}
                                            {node.comment && (
                                                <p className="text-xs bg-muted/50 p-2 rounded mt-1">"{node.comment}"</p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* 结束节点（如果已完成） */}
                                {(record.status === 3 || record.status === 4 || record.status === 5) && (
                                    <div className="relative">
                                        <div className={`absolute -left-5.25 top-1 w-3 h-3 rounded-full ring-4 ring-background ${record.status === 3 ? 'bg-green-500' :
                                            record.status === 5 ? 'bg-gray-500' : 'bg-red-500'
                                            }`} />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {record.status === 3 ? '流程结束（已通过）' :
                                                    record.status === 5 ? '已撤回' : '流程结束（已拒绝）'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {record.completedAt ? new Date(record.completedAt).toLocaleString() : new Date(record.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    )
}
