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
import { motion } from 'framer-motion'
import { Loader2, UserPlus, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [globalError, setGlobalError] = useState<string | null>(null)
    const register = useAuthStore((state) => state.register)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    // 调用 authStore 的注册方法
    const onSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true)
        setGlobalError(null)
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
            console.error('注册错误:', error)
            // 尝试从 API 响应中获取错误信息
            const axiosError = error as { response?: { data?: { message?: string } } }
            const errorMessage = error instanceof Error ? error.message : '注册失败，请稍后重试'
            const finalMessage = axiosError.response?.data?.message || errorMessage

            setGlobalError(finalMessage)
            toast.error(finalMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/40 app-gradient relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <Card className="border-border/50 shadow-2xl glass-card">
                    <CardHeader className="space-y-4 text-center pb-6">
                        {/* Logo Area */}
                        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-primary-500 to-primary-300 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 mb-2 transform rotate-3 transition-transform hover:rotate-0 duration-300">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                注册账户
                            </CardTitle>
                            <CardDescription className="text-base">
                                创建一个新账户以开始使用
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* 错误提示 */}
                                {globalError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 text-destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>注册失败</AlertTitle>
                                            <AlertDescription>
                                                {globalError}
                                            </AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground/80">用户名</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="您的用户名称"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="h-11 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 focus:border-primary-500/50 transition-all duration-300"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground/80">邮箱</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="h-11 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 focus:border-primary-500/50 transition-all duration-300"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground/80">密码</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        {...field}
                                                        disabled={isLoading}
                                                        className="h-11 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 focus:border-primary-500/50 transition-all duration-300"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground/80">确认密码</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        {...field}
                                                        disabled={isLoading}
                                                        className="h-11 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 focus:border-primary-500/50 transition-all duration-300"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 font-medium text-base shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-300 mt-4"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            注册中...
                                        </>
                                    ) : (
                                        '注册账号'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center pb-8">
                        <div className="text-center text-sm text-muted-foreground">
                            已经有账户?{' '}
                            <Link to="/login" className="text-primary font-medium hover:underline hover:text-primary-600 transition-colors">
                                立即登录
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
