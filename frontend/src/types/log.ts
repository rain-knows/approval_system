/**
 * 日志模块类型定义
 * 
 * 定义操作日志相关的接口类型
 */

/**
 * 操作日志接口
 */
export interface OperationLog {
    /** 日志ID */
    id: number
    /** 操作用户ID */
    userId: number
    /** 用户名 */
    username: string
    /** 用户昵称 */
    nickname: string
    /** 模块编码 */
    module: string
    /** 模块名称 */
    moduleName: string
    /** 操作编码 */
    operation: string
    /** 操作名称 */
    operationName: string
    /** 目标业务ID */
    targetId: string | null
    /** 操作详情 */
    detail: string
    /** 客户端IP地址 */
    ipAddress: string
    /** 用户代理信息 */
    userAgent: string
    /** 创建时间 */
    createdAt: string
}

/**
 * 日志查询参数
 */
export interface LogQueryParams {
    /** 页码 */
    page?: number
    /** 每页条数 */
    pageSize?: number
    /** 模块筛选 */
    module?: string
    /** 操作类型筛选 */
    operation?: string
    /** 用户ID筛选 */
    userId?: number
    /** 目标业务ID */
    targetId?: string
    /** 开始日期 */
    startDate?: string
    /** 结束日期 */
    endDate?: string
    /** 详情关键词搜索 */
    keyword?: string
    /** 用户名/昵称关键词搜索 */
    usernameKeyword?: string
}

/**
 * 模块统计项
 */
export interface ModuleStatItem {
    /** 模块编码 */
    module: string
    /** 模块名称 */
    moduleName: string
    /** 数量 */
    count: number
}

/**
 * 操作统计项
 */
export interface OperationStatItem {
    /** 操作编码 */
    operation: string
    /** 操作名称 */
    operationName: string
    /** 数量 */
    count: number
}

/**
 * 每日统计项
 */
export interface DailyStatItem {
    /** 日期 */
    date: string
    /** 数量 */
    count: number
}

/**
 * 日志统计信息
 */
export interface LogStatistics {
    /** 总数 */
    totalCount: number
    /** 按模块统计 */
    moduleStats: ModuleStatItem[]
    /** 按操作类型统计 */
    operationStats: OperationStatItem[]
    /** 每日统计 */
    dailyStats: DailyStatItem[]
}

/**
 * 模块/操作选项
 */
export interface LogOption {
    /** 编码 */
    code: string
    /** 名称 */
    name: string
}
