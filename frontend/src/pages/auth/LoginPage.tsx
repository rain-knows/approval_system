/**
 * 登录页面组件
 *
 * 提供用户登录表单，支持用户名/邮箱和密码登录。
 * 登录成功后跳转到仪表盘。
 */

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'

/**
 * 登录页面
 *
 * 返回：登录表单页面组件
 */
export default function LoginPage() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    // 表单状态
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * 处理表单提交
     *
     * [e] 表单事件
     */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            // 调用真实登录 API
            await login(username, password)
            navigate('/dashboard')
        } catch (err) {
            // 处理登录失败
            const errorMessage = err instanceof Error ? err.message : '登录失败，请检查用户名和密码'
            // 尝试从 API 响应中获取错误信息
            const axiosError = err as { response?: { data?: { message?: string } } }
            setError(axiosError.response?.data?.message || errorMessage)
            console.error('登录错误:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-100 border-border/40 shadow-xl bg-card">
                <CardHeader className="space-y-2 text-center pb-2">
                    {/* Logo Area - Simplified */}
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">欢迎回来</CardTitle>
                    <CardDescription>
                        请输入您的账号密码以登录系统
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* 错误提示 */}
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/5 border border-destructive/10 rounded-md flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* 用户名输入 */}
                        <div className="space-y-2">
                            <Label htmlFor="username">用户名 / 邮箱</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="name@example.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-10"
                                autoComplete="username"
                            />
                        </div>

                        {/* 密码输入 */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">密码</Label>
                                <a href="#" className="text-xs text-primary hover:underline">
                                    忘记密码?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-10"
                                autoComplete="current-password"
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-2">
                        <Button
                            type="submit"
                            className="w-full h-10 font-medium"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    登录中...
                                </span>
                            ) : (
                                '登录'
                            )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            还没有账户?{' '}
                            <a href="/register" className="text-primary font-medium hover:underline">
                                立即注册
                            </a>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
