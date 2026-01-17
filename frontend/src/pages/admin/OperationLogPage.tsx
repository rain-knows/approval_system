/**
 * 操作日志管理页面
 *
 * 仅管理员可访问，提供操作日志的查询、筛选和详情查看功能
 */

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search, FileText, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';

import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    getLogs,
    LOG_MODULES,
    LOG_OPERATIONS,
} from '@/services/logService';
import type { OperationLog, LogQueryParams, LogOption } from '@/types/log';
import type { PaginatedData } from '@/types';

/**
 * 操作日志管理页面组件
 */
export default function OperationLogPage() {
    // 日志数据
    const [logs, setLogs] = useState<OperationLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(15);

    // 筛选条件
    const [keyword, setKeyword] = useState('');
    const [moduleFilter, setModuleFilter] = useState<string>('all');
    const [operationFilter, setOperationFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // 加载状态
    const [loading, setLoading] = useState(true);

    // 详情弹窗
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);

    /**
     * 加载日志数据
     */
    const loadLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params: LogQueryParams = {
                page,
                pageSize,
                // 使用 usernameKeyword 同时搜索用户名、昵称和日志详情
                usernameKeyword: keyword || undefined,
                module: moduleFilter !== 'all' ? moduleFilter : undefined,
                operation: operationFilter !== 'all' ? operationFilter : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            };
            const result: PaginatedData<OperationLog> = await getLogs(params);
            setLogs(result.list);
            setTotal(result.total);
        } catch (error) {
            console.error('加载日志数据失败:', error);
            toast.error('加载日志数据失败');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, keyword, moduleFilter, operationFilter, startDate, endDate]);

    // 初始加载
    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    /**
     * 搜索处理
     */
    const handleSearch = () => {
        setPage(1);
        loadLogs();
    };

    /**
     * 重置筛选
     */
    const handleReset = () => {
        setKeyword('');
        setModuleFilter('all');
        setOperationFilter('all');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    /**
     * 查看详情
     */
    const handleViewDetail = (log: OperationLog) => {
        setSelectedLog(log);
        setDetailOpen(true);
    };

    /**
     * 格式化时间
     */
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '-';
        const date = new Date(timeStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    /**
     * 获取模块样式
     */
    const getModuleStyle = (module: string) => {
        const styles: Record<string, string> = {
            AUTH: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            USER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            DEPARTMENT: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
            ROLE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            APPROVAL: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            WORKFLOW: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
            FILE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            SYSTEM: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        };
        return styles[module] || 'bg-gray-100 text-gray-800';
    };

    /**
     * 获取操作类型样式
     */
    const getOperationStyle = (operation: string) => {
        const styles: Record<string, string> = {
            LOGIN: 'text-blue-600',
            LOGOUT: 'text-gray-600',
            LOGIN_FAIL: 'text-red-600',
            CREATE: 'text-green-600',
            UPDATE: 'text-amber-600',
            DELETE: 'text-red-600',
            APPROVE: 'text-green-600',
            REJECT: 'text-red-600',
            SUBMIT: 'text-indigo-600',
            WITHDRAW: 'text-orange-600',
        };
        return styles[operation] || 'text-gray-600';
    };

    /**
     * 计算总页数
     */
    const totalPages = Math.ceil(total / pageSize);

    return (
        <PageContainer
            title="操作日志"
            description="查看系统操作日志，追踪用户行为和系统事件。"
            action={
                <Button
                    variant="outline"
                    onClick={loadLogs}
                    disabled={loading}
                    className="clickable"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    刷新
                </Button>
            }
        >
            <div className="interactive-card overflow-hidden">
                {/* 筛选栏 */}
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex flex-wrap gap-4">
                        {/* 关键词搜索 */}
                        <div className="flex gap-2 flex-1 min-w-50">
                            <Input
                                placeholder="搜索用户名/日志详情..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="max-w-sm"
                            />
                            <Button variant="outline" onClick={handleSearch} className="clickable">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* 模块筛选 */}
                        <Select
                            value={moduleFilter}
                            onValueChange={(value) => {
                                setModuleFilter(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-35">
                                <SelectValue placeholder="模块" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部模块</SelectItem>
                                {LOG_MODULES.map((m: LogOption) => (
                                    <SelectItem key={m.code} value={m.code}>
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* 操作类型筛选 */}
                        <Select
                            value={operationFilter}
                            onValueChange={(value) => {
                                setOperationFilter(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-35">
                                <SelectValue placeholder="操作" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部操作</SelectItem>
                                {LOG_OPERATIONS.map((o: LogOption) => (
                                    <SelectItem key={o.code} value={o.code}>
                                        {o.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* 日期范围 */}
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-35"
                            />
                            <span className="text-muted-foreground">至</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-35"
                            />
                        </div>

                        {/* 重置按钮 */}
                        <Button variant="ghost" onClick={handleReset} className="clickable">
                            重置
                        </Button>
                    </div>
                </div>

                {/* 日志列表 */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>暂无日志数据</p>
                    </div>
                ) : (
                    <>
                        {/* 表格 */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-4 font-medium">时间</th>
                                        <th className="text-left p-4 font-medium">用户</th>
                                        <th className="text-left p-4 font-medium">模块</th>
                                        <th className="text-left p-4 font-medium">操作</th>
                                        <th className="text-left p-4 font-medium">详情</th>
                                        <th className="text-left p-4 font-medium">IP地址</th>
                                        <th className="text-right p-4 font-medium">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                                                {formatTime(log.createdAt)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                                        {(log.nickname || log.username || '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">{log.nickname || '-'}</div>
                                                        <div className="text-xs text-muted-foreground">@{log.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModuleStyle(log.module)}`}>
                                                    {log.moduleName || log.module}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-medium text-sm ${getOperationStyle(log.operation)}`}>
                                                    {log.operationName || log.operation}
                                                </span>
                                            </td>
                                            <td className="p-4 max-w-75">
                                                <p className="text-sm text-muted-foreground truncate" title={log.detail}>
                                                    {log.detail || '-'}
                                                </p>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {log.ipAddress || '-'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetail(log)}
                                                        className="clickable"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 分页 */}
                        <div className="flex items-center justify-between p-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                共 {total} 条记录，第 {page} / {totalPages} 页
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="clickable"
                                >
                                    上一页
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="clickable"
                                >
                                    下一页
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 日志详情弹窗 */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>日志详情</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">操作时间</label>
                                    <p className="mt-1">{formatTime(selectedLog.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">操作用户</label>
                                    <p className="mt-1">{selectedLog.nickname} (@{selectedLog.username})</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">模块</label>
                                    <p className="mt-1">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModuleStyle(selectedLog.module)}`}>
                                            {selectedLog.moduleName || selectedLog.module}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">操作类型</label>
                                    <p className={`mt-1 font-medium ${getOperationStyle(selectedLog.operation)}`}>
                                        {selectedLog.operationName || selectedLog.operation}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">IP地址</label>
                                    <p className="mt-1">{selectedLog.ipAddress || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">目标ID</label>
                                    <p className="mt-1 font-mono text-sm">{selectedLog.targetId || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">操作详情</label>
                                <p className="mt-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap break-all">
                                    {selectedLog.detail || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">用户代理</label>
                                <p className="mt-1 p-3 bg-muted rounded-md text-xs text-muted-foreground break-all">
                                    {selectedLog.userAgent || '-'}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
