/**
 * 报销表单组件
 *
 * 处理报销申请的表单输入。
 */

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export interface ExpenseItem {
    /** 费用类型 */
    type: string
    /** 金额 */
    amount: number
    /** 说明 */
    description: string
}

export interface ExpenseFormData {
    /** 报销类型 */
    expenseType: string
    /** 报销总金额 */
    totalAmount: number
    /** 费用明细 */
    items: ExpenseItem[]
    /** 备注 */
    remark: string
}

interface ExpenseFormProps {
    /** 表单数据改变回调 */
    onChange?: (data: ExpenseFormData) => void
    /** 初始数据 */
    value?: Partial<ExpenseFormData>
}

/**
 * 报销表单
 *
 * @param props 组件属性
 * @returns 报销表单组件
 */
export function ExpenseForm({ onChange, value }: ExpenseFormProps) {
    const [formData, setFormData] = useState<ExpenseFormData>({
        expenseType: value?.expenseType || '',
        totalAmount: value?.totalAmount || 0,
        items: value?.items || [{ type: '', amount: 0, description: '' }],
        remark: value?.remark || '',
    })

    /**
     * 更新表单字段
     */
    const updateField = <K extends keyof ExpenseFormData>(
        field: K,
        fieldValue: ExpenseFormData[K]
    ) => {
        const newData = { ...formData, [field]: fieldValue }

        // 自动计算总金额
        if (field === 'items') {
            const items = fieldValue as ExpenseItem[]
            newData.totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0)
        }

        setFormData(newData)
        onChange?.(newData)
    }

    /**
     * 添加费用项
     */
    const addItem = () => {
        const newItems = [...formData.items, { type: '', amount: 0, description: '' }]
        updateField('items', newItems)
    }

    /**
     * 删除费用项
     */
    const removeItem = (index: number) => {
        if (formData.items.length <= 1) return
        const newItems = formData.items.filter((_, i) => i !== index)
        updateField('items', newItems)
    }

    /**
     * 更新费用项
     */
    const updateItem = (index: number, field: keyof ExpenseItem, itemValue: unknown) => {
        const newItems = [...formData.items]
        newItems[index] = { ...newItems[index], [field]: itemValue }
        updateField('items', newItems)
    }

    return (
        <div className="space-y-4">
            {/* 报销类型 */}
            <div className="space-y-2">
                <Label htmlFor="expenseType">报销类型 *</Label>
                <Select
                    value={formData.expenseType}
                    onValueChange={(v) => updateField('expenseType', v)}
                >
                    <SelectTrigger id="expenseType">
                        <SelectValue placeholder="选择报销类型" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="travel">差旅费</SelectItem>
                        <SelectItem value="office">办公费</SelectItem>
                        <SelectItem value="entertainment">招待费</SelectItem>
                        <SelectItem value="training">培训费</SelectItem>
                        <SelectItem value="equipment">设备费</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 费用明细 */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>费用明细</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        添加项目
                    </Button>
                </div>

                <div className="space-y-3">
                    {formData.items.map((item, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">项目 {index + 1}</span>
                                {formData.items.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => removeItem(index)}
                                    >
                                        删除
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">费用类型</Label>
                                    <Select
                                        value={item.type}
                                        onValueChange={(v) => updateItem(index, 'type', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择类型" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="transport">交通费</SelectItem>
                                            <SelectItem value="hotel">住宿费</SelectItem>
                                            <SelectItem value="meal">餐饮费</SelectItem>
                                            <SelectItem value="communication">通讯费</SelectItem>
                                            <SelectItem value="material">材料费</SelectItem>
                                            <SelectItem value="other">其他</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">金额（元）</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.amount || ''}
                                        onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">费用说明</Label>
                                <Input
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    placeholder="简要说明费用用途"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 总金额 */}
            <div className="space-y-2">
                <Label>报销总金额</Label>
                <div className="p-3 bg-primary/10 rounded-md">
                    <span className="text-xs text-muted-foreground">¥</span>
                    <span className="text-2xl font-bold text-primary ml-1">
                        {formData.totalAmount.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* 备注 */}
            <div className="space-y-2">
                <Label htmlFor="remark">备注</Label>
                <textarea
                    id="remark"
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="补充说明（可选）"
                    value={formData.remark}
                    onChange={(e) => updateField('remark', e.target.value)}
                />
            </div>
        </div>
    )
}
