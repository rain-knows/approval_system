/**
 * 注册页面
 *
 * 用户注册功能。
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../../components/ui/form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

const registerSchema = z.object({
    username: z.string().min(2, '用户名至少2个字符'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少6个字符'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
})

export default function RegisterPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const register = useAuthStore((state) => state.register)

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    // 调用 authStore 的注册方法
    const handleRegister = async (values: z.infer<typeof registerSchema>) => {
        setLoading(true)
        try {
            await register({
                username: values.username,
                password: values.password,
                nickname: values.username, // 使用用户名作为默认昵称
                email: values.email,
            })
            toast.success('注册成功，请登录')
            navigate('/login')
        } catch (error) {
            console.error(error)
            // 尝试从 API 响应中获取错误信息
            const axiosError = error as { response?: { data?: { message?: string } } }
            toast.error(axiosError.response?.data?.message || '注册失败，请稍后重试')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-100 border-border/40 shadow-xl bg-card">
                <CardHeader className="space-y-2 text-center pb-2">
                    {/* Logo Area */}
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                        <svg
                            className="w-6 h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">注册账户</CardTitle>
                    <CardDescription>创建一个新账户以开始使用</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>用户名</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe" {...field} className="h-10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>邮箱</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} className="h-10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>密码</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} className="h-10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>确认密码</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} className="h-10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        注册中...
                                    </span>
                                ) : '注册'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center pt-2">
                    <div className="text-center text-sm text-muted-foreground">
                        已有账户？{' '}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            立即登录
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
