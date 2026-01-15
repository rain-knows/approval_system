/**
 * TypeScript 类型定义
 *
 * 定义应用中使用的通用类型
 */

/**
 * API 响应基础类型
 */
export interface ApiResponse<T = unknown> {
    /** 状态码 */
    code: number
    /** 消息 */
    message: string
    /** 数据 */
    data: T
    /** 时间戳 */
    timestamp: number
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
    /** 当前页码 */
    page: number
    /** 每页条数 */
    pageSize: number
}

/**
 * 分页响应数据
 */
export interface PaginatedData<T> {
    /** 数据列表 */
    list: T[]
    /** 总条数 */
    total: number
    /** 当前页码 */
    page: number
    /** 每页条数 */
    pageSize: number
    /** 总页数 */
    totalPages: number
}

/**
 * 审批记录类型
 */
export interface Approval {
    /** 审批 ID */
    id: string
    /** 标题 */
    title: string
    /** 内容 */
    content: string
    /** 状态 */
    status: 'draft' | 'pending' | 'in_progress' | 'approved' | 'rejected' | 'withdrawn'
    /** 申请人 ID */
    applicantId: string
    /** 申请人姓名 */
    applicantName: string
    /** 当前审批人 ID */
    currentApproverId?: string
    /** 当前审批人姓名 */
    currentApproverName?: string
    /** 附件列表 */
    attachments?: Attachment[]
    /** 创建时间 */
    createdAt: string
    /** 更新时间 */
    updatedAt: string
}

/**
 * 附件类型
 */
export interface Attachment {
    /** 附件 ID */
    id: string
    /** 文件名 */
    fileName: string
    /** 文件大小 (字节) */
    fileSize: number
    /** 文件类型 */
    fileType: string
    /** 文件 URL */
    fileUrl: string
    /** 上传时间 */
    uploadedAt: string
    /** 是否支持预览 */
    previewSupport?: boolean
}

/**
 * 审批流程节点
 */
export interface ApprovalNode {
    /** 节点 ID */
    id: number
    /** 节点名称 */
    nodeName: string
    /** 审批人 ID */
    approverId: number
    /** 节点顺序 */
    nodeOrder: number
    /** 节点状态: 0-待审批 1-已通过 2-已拒绝 */
    status: number
    /** 审批意见 */
    comment?: string
    /** 审批时间 */
    approvedAt?: string
    /** 创建时间 */
    createdAt?: string
}
