/**
 * 发起审批页面
 *
 * 包含审批类型选择、动态表单填写、附件上传和提交功能。
 * 使用步骤向导模式引导用户完成申请。
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { FileUpload } from '@/components/business/FileUpload'
import { ApprovalTypeSelector } from '@/components/business/ApprovalTypeSelector'
import { LeaveForm, type LeaveFormData } from '@/components/business/forms/LeaveForm'
import { ExpenseForm, type ExpenseFormData } from '@/components/business/forms/ExpenseForm'
import { createApproval, type ApprovalType } from '@/services/approvalService'
import type { Attachment } from '@/types'

export default function ApprovalCreatePage() {
    const navigate = useNavigate()

    // 当前步骤: 1-选择类型, 2-填写表单
    const [step, setStep] = useState(1)

    // 选中的审批类型
    const [selectedType, setSelectedType] = useState<ApprovalType | null>(null)

    // 基本信息
    const [title, setTitle] = useState('')
    const [priority, setPriority] = useState('0')
    const [deadline, setDeadline] = useState('')

    // 动态表单数据
    const [leaveData, setLeaveData] = useState<LeaveFormData>({ leaveType: '', startDate: '', endDate: '', days: 0, reason: '' })
    const [expenseData, setExpenseData] = useState<ExpenseFormData>({ expenseType: '', totalAmount: 0, items: [], remark: '' })
    const [generalContent, setGeneralContent] = useState('')

    // 附件
    const [attachments, setAttachments] = useState<Attachment[]>([])

    // 提交状态
    const [submitting, setSubmitting] = useState(false)

    /**
     * 处理类型选择
     */
    const handleTypeSelect = (_typeCode: string, type: ApprovalType) => {
        setSelectedType(type)
        setTitle(`${type.name}申请 - ${new Date().toLocaleDateString()}`)
        setStep(2)
    }

    /**
     * 处理提交
     */
    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error('请输入审批标题')
            return
        }

        // 验证表单数据
        const contentObj: Record<string, any> = {}
        if (selectedType?.code === 'LEAVE') {
            if (!leaveData.leaveType || !leaveData.startDate || !leaveData.endDate || !leaveData.reason) {
                toast.error('请填写完整的请假信息')
                return
            }
            Object.assign(contentObj, leaveData)
        } else if (selectedType?.code === 'EXPENSE') {
            if (!expenseData.expenseType || expenseData.items.length === 0) {
                toast.error('请填写完整的报销信息')
                return
            }
            Object.assign(contentObj, expenseData)
        } else {
            if (!generalContent.trim()) {
                toast.error('请输入申请内容')
                return
            }
            contentObj['content'] = generalContent
        }

        setSubmitting(true)
        try {
            await createApproval({
                title,
                typeCode: selectedType!.code,
                content: JSON.stringify(contentObj),
                priority: parseInt(priority),
                deadline: deadline || undefined,
                attachmentIds: attachments.map(f => f.id),
            })

            toast.success('您的申请已提交审批')
            navigate('/approval')
        } catch (error) {
            console.error('提交失败:', error)
            toast.error('提交失败，请稍后重试')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="container max-w-4xl py-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">发起审批</h1>

            {/* 步骤 1: 选择审批类型 */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>选择审批类型</CardTitle>
                        <CardDescription>请选择您要发起的审批业务类型</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ApprovalTypeSelector onChange={handleTypeSelect} />
                    </CardContent>
                </Card>
            )}

            {/* 步骤 2: 填写申请详情 */}
            {step === 2 && selectedType && (
                <div className="space-y-6">
                    {/* 返回按钮 */}
                    <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => setStep(1)}>
                        ← 返回选择类型
                    </Button>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 flex items-center justify-center rounded-lg"
                                    style={{ backgroundColor: `${selectedType.color}20`, color: selectedType.color }}
                                >
                                    {/* 这里可以复用 ApprovalTypeSelector 中的图标逻辑，或者简化显示 */}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <CardTitle>{selectedType.name}</CardTitle>
                                    <CardDescription>{selectedType.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* 基本信息 */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="title">标题 *</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={`请输入${selectedType.name}标题`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">紧急程度</Label>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger id="priority">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">普通</SelectItem>
                                            <SelectItem value="1">紧急</SelectItem>
                                            <SelectItem value="2">非常紧急</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deadline">截止日期</Label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6"></div>

                            {/* 动态表单区域 */}
                            {selectedType.code === 'LEAVE' ? (
                                <LeaveForm value={leaveData} onChange={setLeaveData} />
                            ) : selectedType.code === 'EXPENSE' ? (
                                <ExpenseForm value={expenseData} onChange={setExpenseData} />
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="content">申请详情 *</Label>
                                    <textarea
                                        id="content"
                                        className="flex min-h-37.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="请详细描述您的申请内容..."
                                        value={generalContent}
                                        onChange={(e) => setGeneralContent(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="border-t pt-6"></div>

                            {/* 附件上传 */}
                            <div className="space-y-2">
                                <Label>附件</Label>
                                <FileUpload
                                    value={attachments}
                                    onChange={setAttachments}
                                    maxCount={5}
                                />
                            </div>

                            {/* 提交按钮 */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={() => navigate('/dashboard/approvals')} disabled={submitting}>
                                    取消
                                </Button>
                                <Button onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? '提交中...' : '提交申请'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
