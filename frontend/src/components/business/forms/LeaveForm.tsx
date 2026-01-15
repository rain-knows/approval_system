/**
 * 请假表单组件
 *
 * 处理请假申请的表单输入。
 */

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export interface LeaveFormData {
    /** 请假类型 */
    leaveType: string
    /** 开始日期 */
    startDate: string
    /** 结束日期 */
    endDate: string
    /** 请假天数 */
    days: number
    /** 请假事由 */
    reason: string
}

interface LeaveFormProps {
    /** 表单数据改变回调 */
    onChange?: (data: LeaveFormData) => void
    /** 初始数据 */
    value?: Partial<LeaveFormData>
}

/**
 * 请假表单
 *
 * @param props 组件属性
 * @returns 请假表单组件
 */
export function LeaveForm({ onChange, value }: LeaveFormProps) {
    const [formData, setFormData] = useState<LeaveFormData>({
        leaveType: value?.leaveType || '',
        startDate: value?.startDate || '',
        endDate: value?.endDate || '',
        days: value?.days || 0,
        reason: value?.reason || '',
    })

    /**
     * 更新表单字段
     */
    const updateField = <K extends keyof LeaveFormData>(
        field: K,
        fieldValue: LeaveFormData[K]
    ) => {
        const newData = { ...formData, [field]: fieldValue }

        // 自动计算天数
        if (field === 'startDate' || field === 'endDate') {
            if (newData.startDate && newData.endDate) {
                const start = new Date(newData.startDate)
                const end = new Date(newData.endDate)
                const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
                newData.days = diff > 0 ? diff : 0
            }
        }

        setFormData(newData)
        onChange?.(newData)
    }

    return (
        <div className="space-y-4">
            {/* 请假类型 */}
            <div className="space-y-2">
                <Label htmlFor="leaveType">请假类型 *</Label>
                <Select
                    value={formData.leaveType}
                    onValueChange={(v) => updateField('leaveType', v)}
                >
                    <SelectTrigger id="leaveType">
                        <SelectValue placeholder="选择请假类型" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="annual">年假</SelectItem>
                        <SelectItem value="sick">病假</SelectItem>
                        <SelectItem value="personal">事假</SelectItem>
                        <SelectItem value="marriage">婚假</SelectItem>
                        <SelectItem value="maternity">产假</SelectItem>
                        <SelectItem value="bereavement">丧假</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 日期选择 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate">开始日期 *</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => updateField('startDate', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate">结束日期 *</Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => updateField('endDate', e.target.value)}
                    />
                </div>
            </div>

            {/* 请假天数 */}
            <div className="space-y-2">
                <Label>请假天数</Label>
                <div className="p-3 bg-muted/50 rounded-md">
                    <span className="text-2xl font-bold text-primary">{formData.days}</span>
                    <span className="text-muted-foreground ml-1">天</span>
                </div>
            </div>

            {/* 请假事由 */}
            <div className="space-y-2">
                <Label htmlFor="reason">请假事由 *</Label>
                <textarea
                    id="reason"
                    className="flex min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="请详细说明请假原因..."
                    value={formData.reason}
                    onChange={(e) => updateField('reason', e.target.value)}
                />
            </div>
        </div>
    )
}
