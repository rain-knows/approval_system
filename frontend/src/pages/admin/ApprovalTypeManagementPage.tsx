/**
 * 审批类型管理页面
 *
 * 管理审批类型，支持 CRUD 操作。
 */

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getApprovalTypes, type ApprovalType } from '@/services/approvalService'
import api from '@/services/api'
import type { ApiResponse } from '@/types'
import { toast } from 'sonner'

/**
 * 创建/更新审批类型请求
 */
interface ApprovalTypeRequest {
    code: string
    name: string
    description?: string
    icon?: string
    color?: string
    status?: number
}

export default function ApprovalTypeManagementPage() {
    const [types, setTypes] = useState<ApprovalType[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingType, setEditingType] = useState<ApprovalType | null>(null)

    // 表单状态
    const [formData, setFormData] = useState<ApprovalTypeRequest>({
        code: '',
        name: '',
        description: '',
        icon: '',
        color: '#3b82f6',
    })

    // 加载数据
    useEffect(() => {
        loadData()
    }, [])

    /**
     * 加载审批类型列表
     */
    const loadData = async () => {
        setLoading(true)
        try {
            const data = await getApprovalTypes()
            setTypes(data)
        } catch (error) {
            console.error('加载数据失败:', error)
            toast.error('加载数据失败')
        } finally {
            setLoading(false)
        }
    }

    /**
     * 打开新建对话框
     */
    const handleCreate = () => {
        setEditingType(null)
        setFormData({
            code: '',
            name: '',
            description: '',
            icon: '',
            color: '#3b82f6',
        })
        setDialogOpen(true)
    }

    /**
     * 打开编辑对话框
     */
    const handleEdit = (type: ApprovalType) => {
        setEditingType(type)
        setFormData({
            code: type.code,
            name: type.name,
            description: type.description || '',
            icon: type.icon || '',
            color: type.color || '#3b82f6',
        })
        setDialogOpen(true)
    }

    /**
     * 保存审批类型
     */
    const handleSave = async () => {
        if (!formData.code.trim()) {
            toast.error('请输入类型编码')
            return
        }
        if (!formData.name.trim()) {
            toast.error('请输入类型名称')
            return
        }

        try {
            if (editingType) {
                await api.put<ApiResponse<ApprovalType>>(`/v1/approval-types/${editingType.id}`, formData)
                toast.success('更新成功')
            } else {
                await api.post<ApiResponse<ApprovalType>>('/v1/approval-types', formData)
                toast.success('创建成功')
            }
            setDialogOpen(false)
            loadData()
        } catch (error: unknown) {
            console.error('保存失败:', error)
            const axiosError = error as { response?: { data?: { message?: string } } }
            toast.error(axiosError.response?.data?.message || '保存失败')
        }
    }

    /**
     * 删除审批类型
     */
    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除此审批类型吗？')) return
        try {
            await api.delete<ApiResponse<void>>(`/v1/approval-types/${id}`)
            toast.success('删除成功')
            loadData()
        } catch (error: unknown) {
            console.error('删除失败:', error)
            const axiosError = error as { response?: { data?: { message?: string } } }
            toast.error(axiosError.response?.data?.message || '删除失败')
        }
    }

    // 预设颜色
    const presetColors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // violet
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#84cc16', // lime
    ]

    return (
        <PageContainer
            title="审批类型管理"
            description="管理系统中的审批类型。"
            action={<Button onClick={handleCreate}>新建类型</Button>}
        >
            {loading ? (
                <Card>
                    <CardContent className="p-8">
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 bg-muted rounded"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead>编码</TableHead>
                                    <TableHead>名称</TableHead>
                                    <TableHead>描述</TableHead>
                                    <TableHead>颜色</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {types.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            暂无审批类型，点击"新建类型"添加
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    types.map(type => (
                                        <TableRow key={type.id}>
                                            <TableCell>
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                                                    style={{ backgroundColor: type.color || '#3b82f6' }}
                                                >
                                                    {type.icon || type.name.charAt(0)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-sm bg-muted px-2 py-0.5 rounded">
                                                    {type.code}
                                                </code>
                                            </TableCell>
                                            <TableCell className="font-medium">{type.name}</TableCell>
                                            <TableCell className="text-muted-foreground max-w-xs truncate">
                                                {type.description || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded"
                                                        style={{ backgroundColor: type.color || '#3b82f6' }}
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        {type.color || '#3b82f6'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(type)}
                                                >
                                                    编辑
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(type.id)}
                                                >
                                                    删除
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* 编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingType ? '编辑审批类型' : '新建审批类型'}
                        </DialogTitle>
                        <DialogDescription>
                            配置审批类型的基本信息
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>类型编码 *</Label>
                            <Input
                                placeholder="如：LEAVE、EXPENSE"
                                value={formData.code}
                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                disabled={!!editingType}
                            />
                            <p className="text-xs text-muted-foreground">
                                编码用于系统识别，创建后不可修改
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label>类型名称 *</Label>
                            <Input
                                placeholder="如：请假申请、报销申请"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>描述</Label>
                            <Textarea
                                placeholder="请输入类型描述（可选）"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={2}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>图标</Label>
                            <Input
                                placeholder="输入单个字符或 emoji"
                                value={formData.icon}
                                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value.slice(0, 2) }))}
                                maxLength={2}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>主题颜色</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <div className="flex gap-1 flex-wrap">
                                    {presetColors.map(color => (
                                        <button
                                            key={color}
                                            className={`w-6 h-6 rounded-full border-2 ${formData.color === color ? 'border-foreground' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 预览 */}
                        <div className="grid gap-2">
                            <Label>预览</Label>
                            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: formData.color || '#3b82f6' }}
                                >
                                    {formData.icon || formData.name.charAt(0) || '?'}
                                </div>
                                <div>
                                    <div className="font-medium">{formData.name || '类型名称'}</div>
                                    <div className="text-sm text-muted-foreground">{formData.code || 'CODE'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            取消
                        </Button>
                        <Button onClick={handleSave}>
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageContainer>
    )
}
