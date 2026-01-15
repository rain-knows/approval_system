/**
 * 审批类型选择器组件
 *
 * 以卡片形式展示可用的审批类型供用户选择。
 */

import { useEffect, useState } from 'react'
import { getApprovalTypes, type ApprovalType } from '@/services/approvalService'

interface ApprovalTypeSelectorProps {
    /** 选中的类型编码 */
    value?: string
    /** 选择改变回调 */
    onChange?: (typeCode: string, type: ApprovalType) => void
    /** 是否禁用 */
    disabled?: boolean
}

/**
 * 审批类型选择器
 *
 * @param props 组件属性
 * @returns 类型选择器组件
 */
export function ApprovalTypeSelector({
    value,
    onChange,
    disabled = false,
}: ApprovalTypeSelectorProps) {
    // 审批类型列表
    const [types, setTypes] = useState<ApprovalType[]>([])
    // 加载状态
    const [loading, setLoading] = useState(true)

    // 加载审批类型
    useEffect(() => {
        const loadTypes = async () => {
            try {
                const data = await getApprovalTypes()
                setTypes(data)
            } catch (error) {
                console.error('加载审批类型失败:', error)
            } finally {
                setLoading(false)
            }
        }
        loadTypes()
    }, [])

    /**
     * 获取图标组件
     */
    const getIcon = (icon: string) => {
        const icons: Record<string, React.ReactNode> = {
            calendar: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            'dollar-sign': (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'shopping-cart': (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            plane: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            ),
            clock: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'file-text': (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        }
        return icons[icon] || icons['file-text']
    }

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div
                        key={i}
                        className="h-28 bg-muted/50 rounded-lg animate-pulse"
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {types.map(type => (
                <button
                    key={type.code}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange?.(type.code, type)}
                    className={`
                        relative flex flex-col items-center justify-center p-4 h-28
                        border-2 rounded-lg transition-all cursor-pointer
                        ${value === type.code
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/25'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {/* 选中标记 */}
                    {value === type.code && (
                        <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}

                    {/* 图标 */}
                    <div
                        className="w-12 h-12 flex items-center justify-center rounded-lg mb-2"
                        style={{ backgroundColor: `${type.color}20`, color: type.color }}
                    >
                        {getIcon(type.icon)}
                    </div>

                    {/* 名称 */}
                    <span className="text-sm font-medium">{type.name}</span>
                </button>
            ))}
        </div>
    )
}
