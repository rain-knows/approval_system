import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Camera, Loader2, Shield, Eye, EyeOff, Clock, Calendar, User as UserIcon, ChevronRight, Pencil } from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from '@/stores/authStore';
import { getUserById, updateUser, changePassword, type User } from '@/services/userService';
import { uploadFile, getFileDownloadUrl } from '@/services/fileService';

const formSchema = z.object({
    username: z.string().min(3, '用户名至少3个字符').max(50, '用户名不能超过50个字符'),
    nickname: z.string().min(1, '昵称不能为空').max(50, '昵称不能超过50个字符'),
    email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
    phone: z.string().max(20, '手机号不能超过20个字符').optional().or(z.literal('')),
});

const passwordSchema = z.object({
    oldPassword: z.string().min(1, '请输入原密码'),
    newPassword: z.string().min(6, '新密码至少6个字符').max(50, '新密码不能超过50个字符'),
    confirmPassword: z.string().min(1, '请确认新密码'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
});

type FormData = z.infer<typeof formSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const authUser = useAuthStore(s => s.user);
    const token = useAuthStore(s => s.token);
    const setAuth = useAuthStore(s => s.setAuth);
    const logout = useAuthStore(s => s.logout);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);
    const [userDetail, setUserDetail] = useState<User | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [changingPassword, setChangingPassword] = useState(false);
    
    // Dialog states
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    // Password visibility states
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            nickname: '',
            email: '',
            phone: '',
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors },
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const loadProfile = useCallback(async () => {
        if (!authUser?.id) return;
        setLoading(true);
        try {
            const detail = await getUserById(authUser.id);
            setUserDetail(detail);
            setAvatar(detail.avatar ?? null);
            reset({
                username: detail.username,
                nickname: detail.nickname,
                email: detail.email ?? '',
                phone: detail.phone ?? '',
            });
        } catch {
            toast.error('加载个人信息失败');
        } finally {
            setLoading(false);
        }
    }, [authUser?.id, reset]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const syncAuthUser = useCallback((updated: User) => {
        if (!token) return;
        if (!authUser) return;
        setAuth(
            {
                ...authUser,
                username: updated.username,
                nickname: updated.nickname,
                email: updated.email ?? undefined,
                avatar: updated.avatar ?? undefined,
            },
            token
        );
    }, [authUser, setAuth, token]);

    const handleAvatarClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleAvatarSelected = useCallback(async (file: File) => {
        if (!userDetail) return;
        if (!file.type.startsWith('image/')) {
            toast.error('请选择图片文件');
            return;
        }

        setAvatarUploading(true);
        setAvatarUploadProgress(0);

        try {
            const attachment = await uploadFile(file, setAvatarUploadProgress);
            const updated = await updateUser(userDetail.id, {
                username: userDetail.username,
                nickname: userDetail.nickname,
                email: userDetail.email ?? undefined,
                phone: userDetail.phone ?? undefined,
                avatar: attachment.fileUrl,
                departmentId: userDetail.departmentId,
            });
            setUserDetail(updated);
            setAvatar(updated.avatar ?? attachment.fileUrl);
            syncAuthUser(updated);
            toast.success('头像已更新');
        } catch {
            toast.error('头像更新失败');
        } finally {
            setAvatarUploading(false);
            setAvatarUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [syncAuthUser, userDetail]);

    const onSubmit = useCallback(async (data: FormData) => {
        if (!authUser?.id) return;
        if (!userDetail) {
            toast.error('用户信息未加载');
            return;
        }
        setSaving(true);

        try {
            const updated = await updateUser(authUser.id, {
                username: data.username,
                nickname: data.nickname,
                email: data.email || undefined,
                phone: data.phone || undefined,
                avatar: avatar ?? undefined,
                departmentId: userDetail.departmentId,
            });
            setUserDetail(updated);
            setAvatar(updated.avatar ?? avatar);
            syncAuthUser(updated);

            if (authUser.username !== updated.username) {
                toast.success('用户名已更新，请重新登录');
                logout();
                window.location.href = '/login';
                return;
            }

            toast.success('资料已保存');
            setShowEditProfile(false); // Close dialog on success
        } catch {
            toast.error('保存失败');
        } finally {
            setSaving(false);
        }
    }, [authUser, avatar, logout, syncAuthUser, userDetail]);

    const onPasswordSubmit = useCallback(async (data: PasswordFormData) => {
        setChangingPassword(true);
        try {
            await changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
            toast.success('密码修改成功，请重新登录');
            resetPassword();
            logout();
            window.location.href = '/login';
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || '密码修改失败');
        } finally {
            setChangingPassword(false);
            setShowChangePassword(false); // Close dialog
        }
    }, [logout, resetPassword]);

    const formatDateTime = useCallback((dateStr: string | null) => {
        if (!dateStr) return '未知';
        return new Date(dateStr).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const avatarSrc = useMemo(() => {
        if (!avatar) return null;
        return getFileDownloadUrl(avatar);
    }, [avatar]);

    // Helper component for rows
    const InfoRow = ({ label, value, onClick, className }: { label: string, value: string | React.ReactNode, onClick?: () => void, className?: string }) => (
        <div 
            className={`flex items-center justify-between py-4 px-6 transition-colors ${onClick ? 'cursor-pointer hover:bg-muted/30' : ''} ${className || ''}`}
            onClick={onClick}
        >
            <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">{label}</div>
                <div className="text-base mt-1 font-medium">{value || '未设置'}</div>
            </div>
            {onClick && <ChevronRight className="h-5 w-5 text-muted-foreground/50" />}
        </div>
    );

    return (
        <PageContainer
            title="个人信息"
            description="管理有助于我们更好地为您服务的详细信息。"
        >
            <div className="max-w-3xl mx-auto space-y-8">
                
                {/* 基本信息卡片 */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-4 border-b bg-muted/10 flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1.5">
                            <CardTitle>基本信息</CardTitle>
                            <CardDescription>部分信息可能会向其他用户公开。</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowEditProfile(true)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            编辑资料
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 divide-y">
                        {/* 头像行 */}
                        <div 
                            className="flex items-center justify-between py-4 px-6 hover:bg-muted/30 cursor-pointer transition-colors"
                            onClick={handleAvatarClick}
                        >
                            <div className="flex-1">
                                <div className="text-sm font-medium text-muted-foreground">个人资料照片</div>
                                <div className="text-xs text-muted-foreground mt-1">个性化您的账户</div>
                            </div>
                            <div className="relative h-16 w-16 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                                {avatarSrc ? (
                                    <img
                                        src={avatarSrc}
                                        alt="avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xl font-semibold text-muted-foreground">
                                        {userDetail?.nickname?.charAt(0) || userDetail?.username?.charAt(0) || 'U'}
                                    </span>
                                )}
                                {avatarUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                                        {avatarUploadProgress}%
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleAvatarSelected(file);
                                }}
                            />
                        </div>

                        {/* 文本信息行 */}
                        <InfoRow 
                            label="用户名" 
                            value={userDetail?.username} 
                        />
                        <InfoRow 
                            label="昵称" 
                            value={userDetail?.nickname} 
                        />
                        <InfoRow 
                            label="邮箱" 
                            value={userDetail?.email} 
                        />
                        <InfoRow 
                            label="手机号" 
                            value={userDetail?.phone} 
                        />
                    </CardContent>
                </Card>

                {/* 账号安全卡片 */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-4 border-b bg-muted/10">
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            账号安全
                        </CardTitle>
                        <CardDescription>管理您的密码和账号状态。</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 divide-y">
                        <InfoRow 
                            label="密码" 
                            value="••••••••" 
                            onClick={() => setShowChangePassword(true)} 
                        />
                        <div className="flex items-center justify-between py-4 px-6">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-muted-foreground">账号状态</div>
                                <div className="text-base mt-1">
                                    {userDetail?.status === 1 ? (
                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                            正常
                                        </span>
                                    ) : (
                                        <span className="text-destructive font-medium flex items-center gap-1">
                                             <div className="w-2 h-2 rounded-full bg-destructive"></div>
                                            已禁用
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-4 px-6">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-muted-foreground">最后登录</div>
                                <div className="text-base mt-1 font-mono text-sm">
                                    {formatDateTime(userDetail?.lastLoginAt ?? null)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 编辑资料弹窗 */}
                <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>编辑个人资料</DialogTitle>
                            <DialogDescription>
                                修改您的基本信息。完成后点击保存。
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    用户名 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="3-50个字符"
                                    {...register('username')}
                                    disabled={loading || saving}
                                />
                                {errors.username && (
                                    <p className="text-sm text-destructive">{errors.username.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nickname">
                                    昵称 <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nickname"
                                    placeholder="用于系统显示的名称"
                                    {...register('nickname')}
                                    disabled={loading || saving}
                                />
                                {errors.nickname && (
                                    <p className="text-sm text-destructive">{errors.nickname.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">手机号</Label>
                                <Input
                                    id="phone"
                                    placeholder="选填"
                                    {...register('phone')}
                                    disabled={loading || saving}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">邮箱</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register('email')}
                                    disabled={loading || saving}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowEditProfile(false)}>
                                    取消
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    保存修改
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* 修改密码弹窗 */}
                <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>修改密码</DialogTitle>
                            <DialogDescription>
                                为了安全起见，建议定期修改密码。
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="oldPassword">原密码</Label>
                                <div className="relative">
                                    <Input
                                        id="oldPassword"
                                        type={showOldPassword ? 'text' : 'password'}
                                        placeholder="请输入原密码"
                                        {...registerPassword('oldPassword')}
                                        disabled={loading || changingPassword}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    >
                                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordErrors.oldPassword && (
                                    <p className="text-sm text-destructive">{passwordErrors.oldPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">新密码</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder="6-50个字符"
                                        {...registerPassword('newPassword')}
                                        disabled={loading || changingPassword}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">确认新密码</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="请再次输入新密码"
                                        {...registerPassword('confirmPassword')}
                                        disabled={loading || changingPassword}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)}>
                                    取消
                                </Button>
                                <Button type="submit" disabled={changingPassword}>
                                    {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    确认修改
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </PageContainer>
    );
}
