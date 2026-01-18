/**
 * 登录页面组件
 *
 * 提供用户登录表单，支持用户名/邮箱和密码登录。
 * 登录成功后跳转到仪表盘。
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { Loader2, LogIn, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// 登录验证 Schema
const loginSchema = z.object({
    username: z.string().min(1, '请输入用户名或邮箱'),
    password: z.string().min(1, '请输入密码'),
})

type LoginFormValues = z.infer<typeof loginSchema>

/**
 * 登录页面
 *
 * 返回：登录表单页面组件
 */
export default function LoginPage() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [globalError, setGlobalError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // 初始化表单
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    })

    /**
     * 处理表单提交
     *
     * [data] 表单数据
     */
    const onSubmit = async (data: LoginFormValues) => {
        setGlobalError(null)
        setIsLoading(true)

        try {
            // 调用真实登录 API
            await login(data.username, data.password)
            navigate('/dashboard')
        } catch (err) {
            console.error('登录错误:', err)
            // 统一显示通用错误信息，不暴露具体原因（如用户不存在或密码错误）
            setGlobalError('登录失败，请检查用户名或密码')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/40 app-gradient relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

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
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                欢迎回来
                            </CardTitle>
                            <CardDescription className="text-base">
                                请输入您的账号密码以登录系统
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* 错误提示 */}
                                {globalError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 text-destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>登录失败</AlertTitle>
                                            <AlertDescription>
                                                {globalError}
                                            </AlertDescription>
                                        </Alert>
                                    </motion.div>
                                )}

                                {/* 用户名输入 */}
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground/80">用户名 / 邮箱</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="name@example.com"
                                                    disabled={isLoading}
                                                    className="h-11 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 focus:border-primary-500/50 transition-all duration-300"
                                                    autoComplete="username"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 密码输入 */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-foreground/80">密码</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    disabled={isLoading}
                                                    className="h-11 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 focus:border-primary-500/50 transition-all duration-300"
                                                    autoComplete="current-password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-11 font-medium text-base shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-300 mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            登录中...
                                        </>
                                    ) : (
                                        '登 录'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-2 pb-8">
                        <div className="text-center text-sm text-muted-foreground">
                            还没有账户?{' '}
                            <a href="/register" className="text-primary font-medium hover:underline hover:text-primary-600 transition-colors">
                                立即注册
                            </a>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
