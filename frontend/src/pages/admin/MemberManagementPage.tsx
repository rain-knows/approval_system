/**
 * 成员管理页面
 *
 * 仅管理员可访问，提供用户列表展示、搜索筛选和CRUD操作
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Search, Users, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
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
import { UserDialog } from '@/components/business/UserDialog';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    type User,
    type UserRequest,
    type PageResult,
    type RoleInfo,
} from '@/services/userService';
import { getAllDepartments, type Department } from '@/services/departmentService';
import api from '@/services/api';

/**
 * API响应包装
 */
interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

/**
 * 成员管理页面组件
 */
export default function MemberManagementPage() {
    // 用户数据
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    // 筛选条件
    const [keyword, setKeyword] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // 辅助数据
    const [departments, setDepartments] = useState<Department[]>([]);
    const [roles, setRoles] = useState<RoleInfo[]>([]);

    // 加载状态
    const [loading, setLoading] = useState(true);

    // 对话框状态
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    /**
     * 加载用户数据
     */
    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                pageSize,
                keyword: keyword || undefined,
                departmentId: departmentFilter !== 'all' ? Number(departmentFilter) : undefined,
                status: statusFilter !== 'all' ? Number(statusFilter) : undefined,
            };
            const result: PageResult<User> = await getUsers(params);
            setUsers(result.list);
            setTotal(result.total);
        } catch (error) {
            console.error('加载用户数据失败:', error);
            toast.error('加载用户数据失败');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, keyword, departmentFilter, statusFilter]);

    /**
     * 加载辅助数据（部门、角色）
     */
    const loadAuxiliaryData = useCallback(async () => {
        try {
            const [depts, rolesRes] = await Promise.all([
                getAllDepartments(),
                api.get<ApiResponse<RoleInfo[]>>('/roles'),
            ]);
            setDepartments(depts);
            setRoles(rolesRes.data.data || []);
        } catch (error) {
            console.error('加载辅助数据失败:', error);
        }
    }, []);

    // 初始加载
    useEffect(() => {
        loadAuxiliaryData();
    }, [loadAuxiliaryData]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    /**
     * 搜索处理
     */
    const handleSearch = () => {
        setPage(1);
        loadUsers();
    };

    /**
     * 处理新增用户
     */
    const handleAdd = () => {
        setEditingUser(null);
        setDialogOpen(true);
    };

    /**
     * 处理编辑用户
     */
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setDialogOpen(true);
    };

    /**
     * 处理删除用户
     */
    const handleDelete = async (user: User) => {
        if (!window.confirm(`确定要删除用户"${user.nickname}"吗？此操作不可撤销。`)) {
            return;
        }

        try {
            await deleteUser(user.id);
            toast.success('用户删除成功');
            loadUsers();
        } catch (error: unknown) {
            console.error('删除用户失败:', error);
            const errorMessage = error instanceof Error ? error.message : '删除用户失败';
            toast.error(errorMessage);
        }
    };

    /**
     * 处理切换用户状态
     */
    const handleToggleStatus = async (user: User) => {
        const newStatus = user.status === 1 ? 0 : 1;
        const action = newStatus === 1 ? '启用' : '禁用';

        try {
            await updateUserStatus(user.id, newStatus);
            toast.success(`${action}用户成功`);
            loadUsers();
        } catch (error: unknown) {
            console.error('更新用户状态失败:', error);
            const errorMessage = error instanceof Error ? error.message : `${action}用户失败`;
            toast.error(errorMessage);
        }
    };

    /**
     * 处理保存用户
     */
    const handleSave = async (data: UserRequest) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, data);
                toast.success('用户更新成功');
            } else {
                await createUser(data);
                toast.success('用户创建成功');
            }
            loadUsers();
        } catch (error: unknown) {
            console.error('保存用户失败:', error);
            const errorMessage = error instanceof Error ? error.message : '保存用户失败';
            toast.error(errorMessage);
            throw error;
        }
    };

    /**
     * 计算总页数
     */
    const totalPages = Math.ceil(total / pageSize);

    return (
        <PageContainer
            title="成员管理"
            description="管理组织架构与成员权限。"
            action={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={loadUsers}
                        disabled={loading}
                        className="clickable"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        刷新
                    </Button>
                    <Button onClick={handleAdd} className="clickable">
                        <Plus className="h-4 w-4 mr-2" />
                        新增用户
                    </Button>
                </div>
            }
        >
            <div className="interactive-card overflow-hidden">
                {/* 搜索筛选栏 */}
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex flex-wrap gap-4">
                        {/* 关键词搜索 */}
                        <div className="flex gap-2 flex-1 min-w-50">
                            <Input
                                placeholder="搜索用户名、昵称或邮箱..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="max-w-sm"
                            />
                            <Button variant="outline" onClick={handleSearch} className="clickable">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* 部门筛选 */}
                        <Select
                            value={departmentFilter}
                            onValueChange={(value) => {
                                setDepartmentFilter(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="选择部门" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部部门</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={String(dept.id)}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* 状态筛选 */}
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-30">
                                <SelectValue placeholder="状态" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">全部状态</SelectItem>
                                <SelectItem value="1">已启用</SelectItem>
                                <SelectItem value="0">已禁用</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 用户列表 */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>暂无用户数据</p>
                    </div>
                ) : (
                    <>
                        {/* 表格 */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-4 font-medium">用户</th>
                                        <th className="text-left p-4 font-medium">邮箱</th>
                                        <th className="text-left p-4 font-medium">部门</th>
                                        <th className="text-left p-4 font-medium">角色</th>
                                        <th className="text-left p-4 font-medium">状态</th>
                                        <th className="text-right p-4 font-medium">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                        {user.nickname?.charAt(0) || user.username.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.nickname}</div>
                                                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {user.email || '-'}
                                            </td>
                                            <td className="p-4">
                                                {user.departmentName || (
                                                    <span className="text-muted-foreground">未分配</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.length > 0 ? (
                                                        user.roles.map((role) => (
                                                            <span
                                                                key={role.id}
                                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                                            >
                                                                {role.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">无</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {user.status === 1 ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600">
                                                        <UserCheck className="h-4 w-4" />
                                                        启用
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-destructive">
                                                        <UserX className="h-4 w-4" />
                                                        禁用
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(user)}
                                                        className="clickable"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(user)}
                                                        className="clickable"
                                                    >
                                                        {user.status === 1 ? (
                                                            <UserX className="h-4 w-4" />
                                                        ) : (
                                                            <UserCheck className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(user)}
                                                        className="clickable text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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

            {/* 用户编辑对话框 */}
            <UserDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user={editingUser}
                departments={departments}
                roles={roles}
                onSave={handleSave}
                isLoading={loading}
            />
        </PageContainer>
    );
}
