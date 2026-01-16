/**
 * 通知消息页面
 *
 * 显示用户的通知列表，支持筛选和标记已读。
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bell,
    CheckCircle,
    FileCheck,
    Info,
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
    MailOpen,
    Inbox
} from 'lucide-react';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    type Notification
} from '@/services/notificationService';
import type { PaginatedData } from '@/types';
import { cn } from '@/lib/utils';

/**
 * 通知类型对应的图标和颜色
 */
const notificationTypeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
    APPROVAL: { icon: FileCheck, color: 'text-blue-500', label: '审批' },
    SYSTEM: { icon: Info, color: 'text-purple-500', label: '系统' },
    REMINDER: { icon: Clock, color: 'text-amber-500', label: '提醒' }
};

/**
 * 格式化时间显示
 *
 * @param dateStr ISO 日期字符串
 * @returns 格式化后的时间字符串
 */
function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

export default function NotificationsPage() {
    const navigate = useNavigate();
    // 筛选类型：undefined=全部, true=已读, false=未读
    const [filter, setFilter] = useState<boolean | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PaginatedData<Notification> | null>(null);
    const [markingAll, setMarkingAll] = useState(false);

    /**
     * 获取通知列表
     */
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getNotifications(page, pageSize, filter);
            setData(result);
        } catch (error) {
            console.error('获取通知失败:', error);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, filter]);

    // 监听筛选条件和页码变化
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    /**
     * 点击通知项
     * 标记为已读并跳转到关联页面
     */
    const handleNotificationClick = async (notification: Notification) => {
        // 如果未读，先标记为已读
        if (!notification.isRead) {
            try {
                await markAsRead(notification.id);
                // 更新本地状态
                setData(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        list: prev.list.map((n: Notification) =>
                            n.id === notification.id ? { ...n, isRead: true } : n
                        )
                    };
                });
            } catch (error) {
                console.error('标记已读失败:', error);
            }
        }

        // 如果是审批类型且有关联 ID，跳转到审批详情
        if (notification.type === 'APPROVAL' && notification.relatedId) {
            navigate(`/approval/${notification.relatedId}`);
        }
    };

    /**
     * 全部标记为已读
     */
    const handleMarkAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await markAllAsRead();
            // 重新获取数据
            await fetchNotifications();
        } catch (error) {
            console.error('全部标记已读失败:', error);
        } finally {
            setMarkingAll(false);
        }
    };

    /**
     * 处理 Tab 切换
     */
    const handleTabChange = (value: string) => {
        setPage(1); // 切换时重置页码
        if (value === 'all') {
            setFilter(undefined);
        } else if (value === 'unread') {
            setFilter(false);
        } else {
            setFilter(true);
        }
    };

    // 计算未读数量（仅在显示全部时使用）
    const unreadCount = data?.list.filter(n => !n.isRead).length || 0;
    const hasUnread = filter === undefined ? unreadCount > 0 : (filter === false && (data?.list.length || 0) > 0);

    return (
        <PageContainer
            title="消息通知"
            description="查看系统通知与待办事项。"
            action={
                <Button
                    variant="outline"
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll || !hasUnread}
                    className="clickable"
                >
                    {markingAll ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <MailOpen className="mr-2 h-4 w-4" />
                    )}
                    全部标记为已读
                </Button>
            }
        >
            {/* 筛选 Tab */}
            <Tabs
                defaultValue="all"
                className="mb-6"
                onValueChange={handleTabChange}
            >
                <TabsList>
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="unread">未读</TabsTrigger>
                    <TabsTrigger value="read">已读</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* 加载状态 */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {/* 通知列表 */}
            {!loading && data && data.list.length > 0 && (
                <div className="space-y-3">
                    {data.list.map((notification: Notification) => {
                        const typeConfig = notificationTypeConfig[notification.type] || notificationTypeConfig.SYSTEM;
                        const TypeIcon = typeConfig.icon;

                        return (
                            <div
                                key={notification.id}
                                className={cn(
                                    "interactive-card p-4 cursor-pointer transition-all",
                                    "hover:shadow-md hover:border-primary/30",
                                    !notification.isRead && "border-l-4 border-l-primary bg-primary/5"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-4">
                                    {/* 类型图标 */}
                                    <div className={cn("mt-0.5 p-2 rounded-full bg-muted", typeConfig.color)}>
                                        <TypeIcon className="h-4 w-4" />
                                    </div>

                                    {/* 内容区域 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={cn(
                                                "font-medium truncate",
                                                !notification.isRead && "text-foreground",
                                                notification.isRead && "text-muted-foreground"
                                            )}>
                                                {notification.title}
                                            </h4>
                                            <Badge variant="outline" className="text-xs shrink-0">
                                                {typeConfig.label}
                                            </Badge>
                                            {!notification.isRead && (
                                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {notification.content}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* 已读标记 */}
                                    {notification.isRead && (
                                        <CheckCircle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 空状态 */}
            {!loading && data && data.list.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Inbox className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">暂无通知</p>
                    <p className="text-sm mt-1">
                        {filter === false ? '没有未读消息' : filter === true ? '没有已读消息' : '您还没有收到任何通知'}
                    </p>
                </div>
            )}

            {/* 分页 */}
            {!loading && data && data.total > pageSize && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        上一页
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        第 {page} / {Math.ceil(data.total / pageSize)} 页
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= Math.ceil(data.total / pageSize)}
                        onClick={() => setPage(p => p + 1)}
                    >
                        下一页
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </PageContainer>
    );
}

