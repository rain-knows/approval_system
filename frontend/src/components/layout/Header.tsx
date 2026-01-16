/**
 * 顶部导航栏组件
 *
 * 包含侧边栏切换按钮、通知图标和用户个人信息。
 */

import { useState, useEffect, useCallback } from 'react'
import { Menu, User, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Breadcrumbs } from './Breadcrumbs'
import { ThemeToggle } from './ThemeToggle'
import { getUnreadCount } from '@/services/notificationService'


export function Header() {
    const navigate = useNavigate()
    const { toggle } = useSidebarStore()
    const { user, logout, token } = useAuthStore()
    const [unreadCount, setUnreadCount] = useState(0)

    /**
     * 获取未读通知数量
     */
    const fetchUnreadCount = useCallback(async () => {
        if (!token) return
        try {
            const count = await getUnreadCount()
            setUnreadCount(count)
        } catch (error) {
            console.error('获取未读数量失败:', error)
        }
    }, [token])

    // 组件挂载时获取未读数量，并设置定时刷新
    useEffect(() => {
        fetchUnreadCount()

        // 每 30 秒刷新一次
        const interval = setInterval(fetchUnreadCount, 30000)

        return () => clearInterval(interval)
    }, [fetchUnreadCount])

    /**
     * 点击通知图标
     */
    const handleNotificationClick = () => {
        navigate('/notifications')
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background px-4 shadow-sm lg:px-6">
            <Button
                variant="ghost"
                size="icon"
                className="mr-4"
                onClick={toggle}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>

            <Breadcrumbs />


            <div className="flex flex-1 items-center justify-end gap-4">
                {/* 通知按钮 */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={handleNotificationClick}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">通知</span>
                </Button>

                {/* 主题切换按钮 */}
                <ThemeToggle />

                {user && (
                    <span className="text-sm text-muted-foreground hidden md:inline-block">
                        欢迎, {user.username || 'User'}
                    </span>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full border border-input">
                            <User className="h-5 w-5" />
                            <span className="sr-only">User Menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                            个人中心
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem>设置</DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                            退出登录
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

