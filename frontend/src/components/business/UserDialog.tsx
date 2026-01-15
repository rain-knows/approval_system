/**
 * 用户编辑对话框组件
 *
 * 用于新增和编辑用户信息，包括基本信息、部门选择和角色分配
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { User, UserRequest, RoleInfo } from '@/services/userService';
import type { Department } from '@/services/departmentService';

/**
 * 表单验证规则
 */
/**
 * 创建表单验证规则
 * @param isEditMode 是否为编辑模式
 */
const createFormSchema = (isEditMode: boolean) => z.object({
    username: z.string().min(3, '用户名至少3个字符').max(50, '用户名不能超过50个字符'),
    password: isEditMode
        ? z.string().refine(val => val === '' || (val.length >= 6 && val.length <= 50), {
            message: '密码长度应在6-50个字符之间'
        })
        : z.string().min(6, '密码长度应在6-50个字符之间').max(50, '密码长度应在6-50个字符之间'),
    nickname: z.string().min(1, '昵称不能为空').max(50, '昵称不能超过50个字符'),
    email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
    phone: z.string().max(20, '手机号不能超过20个字符').optional().or(z.literal('')),
    departmentId: z.number().nullable().optional(),
    roleIds: z.array(z.number()).optional(),
    status: z.number().min(0).max(1).optional(),
});

type FormData = z.infer<ReturnType<typeof createFormSchema>>;

interface UserDialogProps {
    /** 对话框是否打开 */
    open: boolean;
    /** 关闭对话框回调 */
    onOpenChange: (open: boolean) => void;
    /** 编辑模式时的用户数据 */
    user?: User | null;
    /** 所有部门列表 */
    departments: Department[];
    /** 所有角色列表 */
    roles: RoleInfo[];
    /** 保存回调 */
    onSave: (data: UserRequest) => Promise<void>;
    /** 是否正在加载 */
    isLoading?: boolean;
}

/**
 * 用户编辑对话框
 *
 * @param open 对话框是否打开
 * @param onOpenChange 关闭对话框回调
 * @param user 编辑模式时的用户数据
 * @param departments 所有部门列表
 * @param roles 所有角色列表
 * @param onSave 保存回调
 * @param isLoading 是否正在加载
 */
export function UserDialog({
    open,
    onOpenChange,
    user,
    departments,
    roles,
    onSave,
    isLoading = false,
}: UserDialogProps) {
    const [submitting, setSubmitting] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const isEditMode = !!user;

    // 根据模式创建验证规则
    const formSchema = createFormSchema(isEditMode);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
            nickname: '',
            email: '',
            phone: '',
            departmentId: null,
            roleIds: [],
            status: 1,
        },
    });

    const watchedDeptId = watch('departmentId');

    // 对话框打开时重置表单
    useEffect(() => {
        if (open) {
            if (user) {
                // 编辑模式
                reset({
                    username: user.username,
                    password: '',
                    nickname: user.nickname,
                    email: user.email || '',
                    phone: user.phone || '',
                    departmentId: user.departmentId,
                    roleIds: user.roles.map(r => r.id),
                    status: user.status ?? 1,
                });
                setSelectedRoles(user.roles.map(r => r.id));
            } else {
                // 新增模式
                reset({
                    username: '',
                    password: '',
                    nickname: '',
                    email: '',
                    phone: '',
                    departmentId: null,
                    roleIds: [],
                    status: 1,
                });
                setSelectedRoles([]);
            }
        }
    }, [open, user, reset]);

    /**
     * 切换角色选中状态
     */
    const toggleRole = (roleId: number) => {
        const newRoles = selectedRoles.includes(roleId)
            ? selectedRoles.filter(id => id !== roleId)
            : [...selectedRoles, roleId];
        setSelectedRoles(newRoles);
        setValue('roleIds', newRoles);
    };

    /**
     * 表单提交处理
     */
    const onSubmit = async (data: FormData) => {

        setSubmitting(true);
        try {
            const request: UserRequest = {
                username: data.username,
                nickname: data.nickname,
                email: data.email || undefined,
                phone: data.phone || undefined,
                departmentId: data.departmentId,
                roleIds: selectedRoles,
                status: data.status ?? 1,
            };

            // 仅在有密码时传递
            if (data.password) {
                request.password = data.password;
            }

            await onSave(request);
            onOpenChange(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? '编辑用户' : '新增用户'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? '修改用户信息' : '填写新用户的基本信息'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    {/* 用户名 */}
                    <div className="space-y-2">
                        <Label htmlFor="username">
                            用户名 <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="username"
                            placeholder="3-50个字符"
                            {...register('username')}
                            disabled={submitting}
                        />
                        {errors.username && (
                            <p className="text-sm text-destructive">{errors.username.message}</p>
                        )}
                    </div>

                    {/* 密码 */}
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            密码 {!isEditMode && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder={isEditMode ? '留空则不修改密码' : '6-50个字符'}
                            {...register('password')}
                            disabled={submitting}
                        />
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    {/* 昵称 */}
                    <div className="space-y-2">
                        <Label htmlFor="nickname">
                            昵称 <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="nickname"
                            placeholder="用于系统显示的名称"
                            {...register('nickname')}
                            disabled={submitting}
                        />
                        {errors.nickname && (
                            <p className="text-sm text-destructive">{errors.nickname.message}</p>
                        )}
                    </div>

                    {/* 邮箱和手机 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">邮箱</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="请输入邮箱"
                                {...register('email')}
                                disabled={submitting}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">手机号</Label>
                            <Input
                                id="phone"
                                placeholder="请输入手机号"
                                {...register('phone')}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* 所属部门 */}
                    <div className="space-y-2">
                        <Label>所属部门</Label>
                        <Select
                            value={watchedDeptId ? String(watchedDeptId) : 'none'}
                            onValueChange={(value) => setValue('departmentId', value === 'none' ? null : Number(value))}
                            disabled={submitting}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="选择部门（可选）" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">暂未分配部门</SelectItem>
                                {(departments || []).map((dept) => (
                                    <SelectItem key={dept.id} value={String(dept.id)}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 角色选择 */}
                    <div className="space-y-2">
                        <Label>角色分配</Label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
                            {(roles || []).length === 0 ? (
                                <span className="text-sm text-muted-foreground">暂无可选角色</span>
                            ) : (
                                roles.map((role) => (
                                    <Button
                                        key={role.id}
                                        type="button"
                                        variant={selectedRoles.includes(role.id) ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => toggleRole(role.id)}
                                        disabled={submitting}
                                        className="clickable"
                                    >
                                        {role.name}
                                    </Button>
                                ))
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            取消
                        </Button>
                        <Button type="submit" disabled={submitting || isLoading}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? '保存修改' : '创建用户'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
