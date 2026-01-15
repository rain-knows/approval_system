/**
 * 通用文件上传组件
 *
 * 支持拖拽上传、进度显示、文件列表管理。
 */

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { uploadFile, formatFileSize } from '@/services/fileService'
import type { Attachment } from '@/types'

interface FileUploadProps {
    /** 已上传文件改变回调 */
    onChange?: (files: Attachment[]) => void
    /** 已有的文件列表 */
    value?: Attachment[]
    /** 最大上传数量，默认5 */
    maxCount?: number
    /** 接受的文件类型，默认常用文档格式 */
    accept?: string
    /** 是否禁用 */
    disabled?: boolean
}

/**
 * 文件上传组件
 *
 * @param props 组件属性
 * @returns 文件上传组件
 */
export function FileUpload({
    onChange,
    value = [],
    maxCount = 5,
    accept = '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar',
    disabled = false,
}: FileUploadProps) {
    // 上传文件列表
    const [files, setFiles] = useState<Attachment[]>(value)
    // 是否正在上传
    const [uploading, setUploading] = useState(false)
    // 上传进度
    const [progress, setProgress] = useState(0)
    // 是否拖拽中
    const [isDragging, setIsDragging] = useState(false)
    // 文件输入引用
    const inputRef = useRef<HTMLInputElement>(null)

    /**
     * 处理文件上传
     */
    const handleUpload = useCallback(async (file: File) => {
        if (files.length >= maxCount) {
            return
        }

        setUploading(true)
        setProgress(0)

        try {
            const attachment = await uploadFile(file, (percent) => {
                setProgress(percent)
            })

            const newFiles = [...files, attachment]
            setFiles(newFiles)
            onChange?.(newFiles)
        } catch (error) {
            console.error('上传失败:', error)
        } finally {
            setUploading(false)
            setProgress(0)
        }
    }, [files, maxCount, onChange])

    /**
     * 处理文件选择
     */
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleUpload(file)
        }
        // 重置input以允许再次选择相同文件
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }, [handleUpload])

    /**
     * 处理文件删除
     */
    const handleRemove = useCallback((id: string) => {
        const newFiles = files.filter(f => f.id !== id)
        setFiles(newFiles)
        onChange?.(newFiles)
    }, [files, onChange])

    /**
     * 处理拖拽进入
     */
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    /**
     * 处理拖拽离开
     */
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    /**
     * 处理拖拽悬停
     */
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    /**
     * 处理拖拽放置
     */
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleUpload(file)
        }
    }, [handleUpload])

    const canUpload = !disabled && !uploading && files.length < maxCount

    return (
        <div className="space-y-4">
            {/* 上传区域 */}
            <div
                className={`
                    relative flex flex-col items-center justify-center w-full h-32 
                    border-2 border-dashed rounded-lg transition-colors cursor-pointer
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
                    ${!canUpload ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => canUpload && inputRef.current?.click()}
            >
                {/* 上传图标 */}
                <svg
                    className="w-8 h-8 text-muted-foreground mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                </svg>

                {uploading ? (
                    <div className="w-48">
                        <div className="text-sm text-center text-muted-foreground mb-2">
                            上传中... {progress}%
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm font-medium text-muted-foreground">
                            {isDragging ? '释放以上传文件' : '点击或拖拽上传文件'}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            支持 PDF, Word, Excel, 图片等格式 ({files.length}/{maxCount})
                        </p>
                    </>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={!canUpload}
                />
            </div>

            {/* 文件列表 */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map(file => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {/* 文件图标 */}
                                <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded">
                                    <svg
                                        className="w-5 h-5 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>

                                {/* 文件信息 */}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.fileSize)}
                                    </p>
                                </div>
                            </div>

                            {/* 删除按钮 */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemove(file.id)}
                                disabled={disabled}
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
