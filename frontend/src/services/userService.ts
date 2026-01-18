/**
 * 用户管理 API 服务
 *
 * 提供用户CRUD、分页查询和状态管理的API调用
 */

import api from './api';

/**
 * 角色简单信息
 */
export interface RoleInfo {
    /** 角色ID */
    id: number;
    /** 角色编码 */
    code: string;
    /** 角色名称 */
    name: string;
}

/**
 * 用户信息接口
 */
export interface User {
    /** 用户ID */
    id: number;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 邮箱 */
    email: string | null;
    /** 手机号 */
    phone: string | null;
    /** 头像 */
    avatar: string | null;
    /** 部门ID */
    departmentId: number | null;
    /** 部门名称 */
    departmentName: string | null;
    /** 状态: 0-禁用 1-启用 */
    status: number;
    /** 角色列表 */
    roles: RoleInfo[];
    /** 最后登录时间 */
    lastLoginAt: string | null;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
}

/**
 * 创建/更新用户请求参数
 */
export interface UserRequest {
    /** 用户名 */
    username: string;
    /** 密码（创建时必填，更新时可选） */
    password?: string;
    /** 昵称 */
    nickname: string;
    /** 邮箱 */
    email?: string;
    /** 手机号 */
    phone?: string;
    /** 头像 */
    avatar?: string;
    /** 部门ID */
    departmentId?: number | null;
    /** 角色ID列表 */
    roleIds?: number[];
    /** 状态 */
    status?: number;
}

/**
 * 分页查询参数
 */
export interface UserQueryParams {
    /** 搜索关键词 */
    keyword?: string;
    /** 部门ID */
    departmentId?: number;
    /** 状态 */
    status?: number;
    /** 页码 */
    page?: number;
    /** 每页条数 */
    pageSize?: number;
}

/**
 * 分页结果
 */
export interface PageResult<T> {
    /** 数据列表 */
    list: T[];
    /** 总数 */
    total: number;
    /** 当前页 */
    page: number;
    /** 每页条数 */
    pageSize: number;
    /** 总页数 */
    totalPages: number;
}

/**
 * API响应包装
 */
interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
    timestamp: number;
}

/**
 * 分页查询用户列表
 *
 * @param params 查询参数
 * @returns 分页结果
 */
export async function getUsers(params: UserQueryParams = {}): Promise<PageResult<User>> {
    const response = await api.get<ApiResponse<PageResult<User>>>('/users', { params });
    return response.data.data;
}

/**
 * 获取所有用户列表（用于下拉选择）
 *
 * @returns 用户列表
 */
export async function getAllUsers(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users/all');
    return response.data.data;
}

/**
 * 获取用户详情
 *
 * @param id 用户ID
 * @returns 用户详情
 */
export async function getUserById(id: number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
}

/**
 * 创建用户
 *
 * @param data 用户信息
 * @returns 创建的用户
 */
export async function createUser(data: UserRequest): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data;
}

/**
 * 更新用户
 *
 * @param id 用户ID
 * @param data 用户信息
 * @returns 更新后的用户
 */
export async function updateUser(id: number, data: UserRequest): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
}

/**
 * 删除用户
 *
 * @param id 用户ID
 */
export async function deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
}

/**
 * 更新用户状态
 *
 * @param id 用户ID
 * @param status 状态
 */
export async function updateUserStatus(id: number, status: number): Promise<void> {
    await api.put(`/users/${id}/status`, { status });
}

/**
 * 修改密码请求参数
 */
export interface ChangePasswordRequest {
    /** 原密码 */
    oldPassword: string;
    /** 新密码 */
    newPassword: string;
}

/**
 * 修改当前用户密码
 *
 * @param data 修改密码请求
 */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.put('/users/me/password', data);
}
