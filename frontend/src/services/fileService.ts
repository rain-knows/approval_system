/**
 * 文件服务
 *
 * 处理文件上传、下载相关操作
 */

import api from './api'
import type { ApiResponse, Attachment } from '@/types'

/**
 * 上传文件
 *
 * @param file 要上传的文件
 * @param onProgress 上传进度回调（可选）
 * @returns 附件信息
 */
export async function uploadFile(
    file: File,
    onProgress?: (percent: number) => void
): Promise<Attachment> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<ApiResponse<Attachment>>(
        '/files/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    onProgress(percent)
                }
            },
        }
    )

    return response.data.data
}

/**
 * 获取附件信息
 *
 * @param id 附件ID
 * @returns 附件信息
 */
export async function getFileInfo(id: string): Promise<Attachment> {
    const response = await api.get<ApiResponse<Attachment>>(`/files/${id}`)
    return response.data.data
}

/**
 * 删除附件
 *
 * @param id 附件ID
 */
export async function deleteFile(id: string): Promise<void> {
    await api.delete(`/files/${id}`)
}

/**
 * 获取文件下载URL
 *
 * @param fileUrl 文件路径
 * @returns 完整下载URL
 */
export function getFileDownloadUrl(fileUrl: string): string {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
    // 如果fileUrl已经是完整路径，直接返回
    if (fileUrl.startsWith('http')) {
        return fileUrl
    }
    const baseUrl = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl
    return `${baseUrl}${fileUrl}`
}

/**
 * 格式化文件大小
 *
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
