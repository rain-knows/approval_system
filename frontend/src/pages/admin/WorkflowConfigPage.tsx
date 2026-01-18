/**
 * 工作流配置页面
 *
 * 管理审批工作流模板，支持 CRUD 和状态切换。
 */

import { useState, useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    getWorkflows,
    getWorkflowDetail,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    type Workflow,
    type WorkflowNode,
} from '@/services/workflowService'
import { getApprovalTypes, type ApprovalType } from '@/services/approvalService'
import { getAllUsers, type User } from '@/services/userService'
import { getAllPositions, type Position } from '@/services/positionService'
import { toast } from 'sonner'

export default function WorkflowConfigPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [approvalTypes, setApprovalTypes] = useState<ApprovalType[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [positions, setPositions] = useState<Position[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)

    // 表单状态
    const [formData, setFormData] = useState({
        name: '',
        typeCode: '',
        description: '',
        status: 1,
        nodes: [] as WorkflowNode[],
    })

    // 加载数据
    useEffect(() => {
        loadData()
    }, [])

    /**
     * 加载工作流列表、审批类型、用户列表和职位列表
     */
    const loadData = async () => {
        setLoading(true)
        try {
            const [workflowData, typeData, userData, positionData] = await Promise.all([
                getWorkflows(1, 100),
                getApprovalTypes(),
                getAllUsers(),
                getAllPositions(),
            ])
            setWorkflows(workflowData.list)
            setApprovalTypes(typeData)
            setUsers(userData)
            setPositions(positionData)
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
        setEditingWorkflow(null)
        setFormData({
            name: '',
            typeCode: '',
            description: '',
            status: 1,
            nodes: [
                { nodeName: '直属上级', nodeOrder: 1, approverType: 'DEPARTMENT_HEAD' }
            ],
        })
        setDialogOpen(true)
    }

    /**
     * 打开编辑对话框
     *
     * 需要先获取工作流详情，因为列表 API 不返回节点数据
     */
    const handleEdit = async (workflow: Workflow) => {
        try {
            // 获取完整的工作流详情（包括节点列表）
            const detail = await getWorkflowDetail(workflow.id)
            setEditingWorkflow(detail)
            setFormData({
                name: detail.name,
                typeCode: detail.typeCode,
                description: detail.description || '',
                status: detail.status,
                nodes: detail.nodes || [],
            })
            setDialogOpen(true)
        } catch (error) {
            console.error('获取工作流详情失败:', error)
            toast.error('获取工作流详情失败')
        }
    }

    /**
     * 添加节点
     */
    const addNode = () => {
        setFormData(prev => ({
            ...prev,
            nodes: [
                ...prev.nodes,
                {
                    nodeName: `审批节点 ${prev.nodes.length + 1}`,
                    nodeOrder: prev.nodes.length + 1,
                    approverType: 'USER',
                }
            ]
        }))
    }

    /**
     * 更新节点
     */
    const updateNode = (index: number, field: keyof WorkflowNode, value: WorkflowNode[keyof WorkflowNode]) => {
        setFormData(prev => ({
            ...prev,
            nodes: prev.nodes.map((node, i) =>
                i === index ? { ...node, [field]: value } : node
            )
        }))
    }

    /**
     * 删除节点
     */
    const removeNode = (index: number) => {
        setFormData(prev => ({
            ...prev,
            nodes: prev.nodes
                .filter((_, i) => i !== index)
                .map((node, i) => ({ ...node, nodeOrder: i + 1 }))
        }))
    }

    /**
     * 保存工作流
     */
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('请输入模板名称')
            return
        }
        if (!formData.typeCode) {
            toast.error('请选择审批类型')
            return
        }
        if (formData.nodes.length === 0) {
            toast.error('请至少添加一个审批节点')
            return
        }

        try {
            if (editingWorkflow) {
                await updateWorkflow(editingWorkflow.id, {
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                    nodes: formData.nodes,
                })
                toast.success('更新成功')
            } else {
                await createWorkflow({
                    name: formData.name,
                    typeCode: formData.typeCode,
                    description: formData.description,
                    status: formData.status,
                    nodes: formData.nodes,
                })
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
     * 删除工作流
     */
    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除此工作流吗？')) return
        try {
            await deleteWorkflow(id)
            toast.success('删除成功')
            loadData()
        } catch (error: unknown) {
            console.error('删除失败:', error)
            const axiosError = error as { response?: { data?: { message?: string } } }
            toast.error(axiosError.response?.data?.message || '删除失败')
        }
    }

    // 审批人类型选项
    const approverTypes = [
        { value: 'USER', label: '指定用户' },
        { value: 'POSITION', label: '指定职位' },
        { value: 'DEPARTMENT_HEAD', label: '部门负责人' },
    ]

    /**
     * 用户 Combobox 选择器组件
     */
    const UserCombobox = ({ value, onChange }: { value?: number; onChange: (id?: number) => void }) => {
        const [open, setOpen] = useState(false)
        const selectedUser = users.find(u => u.id === value)

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between font-normal"
                    >
                        {selectedUser ? selectedUser.nickname : '选择用户...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-62.5 p-0" align="start">
                    <Command>
                        <CommandInput placeholder="搜索用户..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>未找到用户</CommandEmpty>
                            <CommandGroup>
                                {users.map(user => (
                                    <CommandItem
                                        key={user.id}
                                        value={`${user.nickname} ${user.username}`}
                                        onSelect={() => {
                                            onChange(user.id)
                                            setOpen(false)
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <span>{user.nickname}</span>
                                            <span className="text-xs text-muted-foreground">{user.username}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                                'ml-auto h-4 w-4',
                                                value === user.id ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }

    /**
     * 职位 Combobox 选择器组件
     */
    const PositionCombobox = ({ value, onChange }: { value?: number; onChange: (id?: number) => void }) => {
        const [open, setOpen] = useState(false)
        const selectedPosition = positions.find(p => p.id === value)

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between font-normal"
                    >
                        {selectedPosition ? selectedPosition.name : '选择职位...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-62.5 p-0" align="start">
                    <Command>
                        <CommandInput placeholder="搜索职位..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>未找到职位</CommandEmpty>
                            <CommandGroup>
                                {positions.map(position => (
                                    <CommandItem
                                        key={position.id}
                                        value={`${position.name} ${position.code}`}
                                        onSelect={() => {
                                            onChange(position.id)
                                            setOpen(false)
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <span>{position.name}</span>
                                            <span className="text-xs text-muted-foreground">{position.code}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                                'ml-auto h-4 w-4',
                                                value === position.id ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <PageContainer
            title="工作流配置"
            description="设计与管理业务审批流模板。"
            action={<Button onClick={handleCreate}>新建流程</Button>}
        >
            {loading ? (
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-4 bg-muted rounded w-full"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-3">
                    {workflows.map(workflow => (
                        <Card
                            key={workflow.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleEdit(workflow)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {workflow.typeName || workflow.typeCode}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={workflow.status === 1 ? 'success' : 'secondary'}>
                                        {workflow.status === 1 ? '启用' : '禁用'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{workflow.nodeCount || 0} 个审批节点</span>
                                    <span>{workflow.createdByName || '系统'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* 新建卡片 */}
                    <div
                        className="border border-dashed border-muted-foreground/25 rounded-xl p-6 flex items-center justify-center min-h-40 hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={handleCreate}
                    >
                        + 创建新模板
                    </div>
                </div>
            )}

            {/* 编辑对话框 */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingWorkflow ? '编辑工作流' : '新建工作流'}
                        </DialogTitle>
                        <DialogDescription>
                            配置审批流程模板及审批节点
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* 基本信息 */}
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>模板名称 *</Label>
                                <Input
                                    placeholder="请输入模板名称"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>审批类型 *</Label>
                                <Select
                                    value={formData.typeCode}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, typeCode: value }))}
                                    disabled={!!editingWorkflow}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="请选择审批类型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {approvalTypes.map(type => (
                                            <SelectItem key={type.code} value={type.code}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>描述</Label>
                                <Textarea
                                    placeholder="请输入模板描述（可选）"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.status === 1}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 1 : 0 }))}
                                />
                                <Label>启用此模板</Label>
                            </div>
                        </div>

                        {/* 审批节点 */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-base font-semibold">审批节点</Label>
                                <Button variant="outline" size="sm" onClick={addNode}>
                                    添加节点
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {formData.nodes.map((node, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-muted/30">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 grid gap-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs">节点名称</Label>
                                                        <Input
                                                            value={node.nodeName}
                                                            onChange={(e) => updateNode(index, 'nodeName', e.target.value)}
                                                            placeholder="节点名称"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">审批人类型</Label>
                                                        <Select
                                                            value={node.approverType}
                                                            onValueChange={(value) => {
                                                                // 切换类型时清空已选择的审批人
                                                                updateNode(index, 'approverType', value)
                                                                updateNode(index, 'approverId', undefined)
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {approverTypes.map(type => (
                                                                    <SelectItem key={type.value} value={type.value}>
                                                                        {type.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                {/* 用户选择器 */}
                                                {node.approverType === 'USER' && (
                                                    <div>
                                                        <Label className="text-xs">选择用户</Label>
                                                        <UserCombobox
                                                            value={node.approverId}
                                                            onChange={(id) => updateNode(index, 'approverId', id)}
                                                        />
                                                    </div>
                                                )}
                                                {/* 职位选择器 */}
                                                {node.approverType === 'POSITION' && (
                                                    <div>
                                                        <Label className="text-xs">选择职位</Label>
                                                        <PositionCombobox
                                                            value={node.approverId}
                                                            onChange={(id) => updateNode(index, 'approverId', id)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {formData.nodes.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => removeNode(index)}
                                                >
                                                    删除
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        {editingWorkflow && (
                            <Button variant="destructive" onClick={() => handleDelete(editingWorkflow.id)} className="mr-auto">
                                删除
                            </Button>
                        )}
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
