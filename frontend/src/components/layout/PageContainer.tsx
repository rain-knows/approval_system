import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
    children: ReactNode;
    className?: string;
    title?: ReactNode;
    description?: string;
    action?: ReactNode;
}

/**
 * 页面容器组件
 * 
 * 提供统一的内边距、淡入动画和头部布局结构。
 * 
 * @param children 页面内容
 * @param className 自定义样式类
 * @param title 页面标题
 * @param description 页面描述
 * @param action 页面顶部操作区（如按钮）
 */
export function PageContainer({
    children,
    className,
    title,
    description,
    action
}: PageContainerProps) {
    return (
        <div className={cn("container mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500", className)}>
            {(title || description || action) && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="space-y-1">
                        {title && (
                            <h1 className="text-3xl font-bold tracking-tight text-foreground/90">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && (
                        <div className="flex items-center gap-2">
                            {action}
                        </div>
                    )}
                </div>
            )}
            <div className="relative">
                {children}
            </div>
        </div>
    );
}
