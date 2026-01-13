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
            // TODO: 替换为实际的 API 调用
            // 模拟登录请求
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // 模拟登录成功
            const mockUser = {
                id: '1',
                username: username,
                email: `${username}@example.com`,
                role: 'user' as const,
            }
            const mockToken = 'mock-jwt-token'

            login(mockUser, mockToken)
            navigate('/dashboard')
        } catch (err) {
            // 处理登录失败
            setError('登录失败，请检查用户名和密码')
            console.error('登录错误:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

            <Card className="w-full max-w-md relative backdrop-blur-sm bg-card/90 border-border/50 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    {/* Logo */}
                    <div className="w-16 h-16 bg-linear-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg
                            className="w-8 h-8 text-primary-foreground"
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
                    <CardTitle className="text-2xl font-bold">审批系统</CardTitle>
                    <CardDescription>
                        请登录您的账户以继续
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* 错误提示 */}
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* 用户名输入 */}
                        <div className="space-y-2">
                            <Label htmlFor="username">用户名 / 邮箱</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="请输入用户名或邮箱"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>

                        {/* 密码输入 */}
                        <div className="space-y-2">
                            <Label htmlFor="password">密码</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="请输入密码"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full"
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

                        <p className="text-sm text-muted-foreground text-center">
                            还没有账户？{' '}
                            <a href="/register" className="text-primary hover:underline">
                                立即注册
                            </a>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
