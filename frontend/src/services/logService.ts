/**
 * 日志服务
 *
 * 处理操作日志相关API调用
 */

import api from './api'
import type { ApiResponse, PaginatedData } from '@/types'
import type { OperationLog, LogQueryParams, LogStatistics, LogOption } from '@/types/log'

/**
 * 获取操作日志列表
 *
 * @param params 查询参数
 * @returns 分页日志列表
 */
export async function getLogs(params: LogQueryParams = {}): Promise<PaginatedData<OperationLog>> {
    const response = await api.get<ApiResponse<PaginatedData<OperationLog>>>('/v1/logs', { params })
    return response.data.data
}

/**
 * 获取日志统计信息
 *
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 统计信息
 */
export async function getLogStatistics(
    startDate?: string,
    endDate?: string
): Promise<LogStatistics> {
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await api.get<ApiResponse<LogStatistics>>('/v1/logs/statistics', { params })
    return response.data.data
}

/**
 * 根据业务ID获取日志
 *
 * @param targetId 业务ID
 * @returns 相关日志列表
 */
export async function getLogsByTargetId(targetId: string): Promise<OperationLog[]> {
    const response = await api.get<ApiResponse<OperationLog[]>>(`/v1/logs/target/${targetId}`)
    return response.data.data
}

/**
 * 获取模块列表
 *
 * @returns 模块列表
 */
export async function getModules(): Promise<LogOption[]> {
    const response = await api.get<ApiResponse<LogOption[]>>('/v1/logs/modules')
    return response.data.data
}

/**
 * 获取操作类型列表
 *
 * @returns 操作类型列表
 */
export async function getOperations(): Promise<LogOption[]> {
    const response = await api.get<ApiResponse<LogOption[]>>('/v1/logs/operations')
    return response.data.data
}

/**
 * 日志模块常量（前端静态定义，用于快速渲染）
 */
export const LOG_MODULES: LogOption[] = [
    { code: 'AUTH', name: '认证模块' },
    { code: 'USER', name: '用户管理' },
    { code: 'DEPARTMENT', name: '部门管理' },
    { code: 'ROLE', name: '角色管理' },
    { code: 'APPROVAL', name: '审批管理' },
    { code: 'WORKFLOW', name: '工作流管理' },
    { code: 'FILE', name: '文件管理' },
    { code: 'SYSTEM', name: '系统配置' },
]

/**
 * 日志操作类型常量（前端静态定义，用于快速渲染）
 */
export const LOG_OPERATIONS: LogOption[] = [
    { code: 'LOGIN', name: '登录' },
    { code: 'LOGOUT', name: '登出' },
    { code: 'LOGIN_FAIL', name: '登录失败' },
    { code: 'PASSWORD_CHANGE', name: '密码修改' },
    { code: 'CREATE', name: '创建' },
    { code: 'UPDATE', name: '更新' },
    { code: 'DELETE', name: '删除' },
    { code: 'VIEW', name: '查看' },
    { code: 'SUBMIT', name: '提交' },
    { code: 'APPROVE', name: '审批通过' },
    { code: 'REJECT', name: '审批拒绝' },
    { code: 'WITHDRAW', name: '撤回' },
    { code: 'ASSIGN_ROLE', name: '分配角色' },
    { code: 'UPLOAD', name: '上传' },
    { code: 'DOWNLOAD', name: '下载' },
]

/**
 * 根据模块编码获取模块名称
 */
export function getModuleName(code: string): string {
    const module = LOG_MODULES.find(m => m.code === code)
    return module?.name || code
}

/**
 * 根据操作编码获取操作名称
 */
export function getOperationName(code: string): string {
    const operation = LOG_OPERATIONS.find(o => o.code === code)
    return operation?.name || code
}
