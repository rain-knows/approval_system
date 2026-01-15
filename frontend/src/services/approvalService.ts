/**
 * 审批服务
 *
 * 处理审批相关API调用
 */

import api from './api'
import type { ApiResponse, PaginatedData, Attachment } from '@/types'

/**
 * 审批类型
 */
export interface ApprovalType {
    /** 类型ID */
    id: number
    /** 类型编码 */
    code: string
    /** 类型名称 */
    name: string
    /** 类型描述 */
    description: string
    /** 图标名称 */
    icon: string
    /** 主题颜色 */
    color: string
}

/**
 * 审批记录
 */
export interface ApprovalRecord {
    /** 审批ID */
    id: string
    /** 标题 */
    title: string
    /** 类型编码 */
    typeCode: string
    /** 类型名称 */
    typeName: string
    /** 类型图标 */
    typeIcon?: string
    /** 类型颜色 */
    typeColor?: string
    /** 内容（JSON） */
    content: string
    /** 发起人ID */
    initiatorId: number
    /** 发起人姓名 */
    initiatorName: string
    /** 紧急程度 */
    priority: number
    /** 状态码 */
    status: number
    /** 状态名称 */
    statusName: string
    /** 当前节点序号 */
    currentNodeOrder: number
    /** 创建时间 */
    createdAt: string
    /** 更新时间 */
    updatedAt: string
    /** 完成时间 */
    completedAt?: string
    /** 附件列表 */
    attachments?: Attachment[]
    /** 审批节点列表 */
    nodes?: import('@/types').ApprovalNode[]
}

/**
 * 发起审批请求
 */
export interface CreateApprovalRequest {
    /** 审批标题 */
    title: string
    /** 审批类型编码 */
    typeCode: string
    /** 审批内容（JSON） */
    content: string
    /** 紧急程度 */
    priority?: number
    /** 截止日期 */
    deadline?: string
    /** 附件ID列表 */
    attachmentIds?: string[]
}

/**
 * 获取审批类型列表
 *
 * @returns 审批类型列表
 */
export async function getApprovalTypes(): Promise<ApprovalType[]> {
    const response = await api.get<ApiResponse<ApprovalType[]>>('/approvals/types')
    return response.data.data
}

/**
 * 发起审批
 *
 * @param data 创建审批请求
 * @returns 审批记录
 */
export async function createApproval(data: CreateApprovalRequest): Promise<ApprovalRecord> {
    const response = await api.post<ApiResponse<ApprovalRecord>>('/approvals', data)
    return response.data.data
}

/**
 * 获取我的申请列表
 *
 * @param page 页码
 * @param pageSize 每页条数
 * @param status 状态筛选（可选）
 * @returns 分页结果
 */
export async function getMyApprovals(
    page: number = 1,
    pageSize: number = 10,
    status?: number
): Promise<PaginatedData<ApprovalRecord>> {
    const params: Record<string, unknown> = { page, pageSize }
    if (status !== undefined) {
        params.status = status
    }
    const response = await api.get<ApiResponse<PaginatedData<ApprovalRecord>>>('/approvals/my', { params })
    return response.data.data
}

/**
 * 获取审批详情
 *
 * @param id 审批ID
 * @returns 审批详情
 */
export async function getApprovalDetail(id: string): Promise<ApprovalRecord> {
    const response = await api.get<ApiResponse<ApprovalRecord>>(`/approvals/${id}`)
    return response.data.data
}

/**
 * 状态映射
 */
export const APPROVAL_STATUS_MAP: Record<number, { label: string; color: string }> = {
    0: { label: '草稿', color: 'gray' },
    1: { label: '待审批', color: 'yellow' },
    2: { label: '审批中', color: 'blue' },
    3: { label: '已通过', color: 'green' },
    4: { label: '已拒绝', color: 'red' },
    5: { label: '已撤回', color: 'gray' },
}

/**
 * 获取状态样式
 *
 * @param status 状态码
 * @returns 样式类名和文本
 */
export function getStatusBadge(status: number): { className: string; text: string } {
    const styles: Record<number, { className: string; text: string }> = {
        0: { className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', text: '草稿' },
        1: { className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', text: '待审批' },
        2: { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', text: '审批中' },
        3: { className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', text: '已通过' },
        4: { className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', text: '已拒绝' },
        5: { className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', text: '已撤回' },
    }
    return styles[status] || styles[1]
}
