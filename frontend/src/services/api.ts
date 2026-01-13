/**
 * API 服务配置
 *
 * 全局 Axios 实例配置，包括拦截器和基础 URL。
 * 提供 Mock 数据的开关或占位。
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

// 从环境变量获取 API 地址，默认为本地
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 请求拦截器：添加 Token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 从 zustand store 获取 token
        // 注意：在组件外部使用 hooks 需要小心，这里直接使用 useAuthStore.getState()
        const token = useAuthStore.getState().token

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    }
)

// 响应拦截器：统一错误处理
api.interceptors.response.use(
    (response) => {
        // 假设后端返回格式为 { code: 200, data: ..., message: ... }
        // 如果是直接返回数据，则直接返回 response.data
        return response
    },
    (error: AxiosError) => {
        if (error.response) {
            // 处理 401 未授权
            if (error.response.status === 401) {
                // 清除 Token 并重定向（可选，或由组件内的 effect 处理）
                useAuthStore.getState().logout()
                // window.location.href = '/login' // 尽量避免直接操作 location
            }

            // 可以添加更具体的错误处理逻辑
            console.error('API Error:', error.response.data || error.message)
        }
        return Promise.reject(error)
    }
)

export default api

// --- Mock 接口预留 ---

export const mockApi = {
    // 模拟审批列表
    getApprovals: async () => {
        await new Promise(resolve => setTimeout(resolve, 500)) // 模拟延迟
        return [
            { id: 1, title: '请假申请 - 张三', status: 'pending', createdAt: '2023-10-01' },
            { id: 2, title: '报销申请 - 李四', status: 'approved', createdAt: '2023-09-28' },
            { id: 3, title: '设备采购 - 王五', status: 'rejected', createdAt: '2023-09-25' },
        ]
    }
}
