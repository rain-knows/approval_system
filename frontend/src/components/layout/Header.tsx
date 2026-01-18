/**
 * 顶部导航栏组件
 *
 * 包含侧边栏切换按钮、通知图标和用户个人信息。
 */

import { useState, useEffect, useCallback } from 'react'
import { Menu, User, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useAuthStore } from '@/stores/authStore'
import { getFileDownloadUrl } from '@/services/fileService'
import { useNavigate } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Breadcrumbs } from './Breadcrumbs'
import { ThemeToggle } from './ThemeToggle'
import { getUnreadCount } from '@/services/notificationService'
import { CommandPalette } from './CommandPalette'


export function Header() {
    const navigate = useNavigate()
    const { toggle } = useSidebarStore()
    const { user, logout, token } = useAuthStore()
    const [unreadCount, setUnreadCount] = useState(0)
    const [commandOpen, setCommandOpen] = useState(false)

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
        const timeout = setTimeout(fetchUnreadCount, 0)

        // 每 30 秒刷新一次
        const interval = setInterval(fetchUnreadCount, 30000)

        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
        }
    }, [fetchUnreadCount])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isCtrlOrMeta = event.ctrlKey || event.metaKey
            if (isCtrlOrMeta && event.key.toLowerCase() === 'k') {
                event.preventDefault()
                setCommandOpen(true)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    /**
     * 点击通知图标
     */
    const handleNotificationClick = () => {
        navigate('/notifications')
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background/80 px-4 shadow-sm backdrop-blur lg:px-6">
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

            <div className="ml-4 hidden flex-1 items-center lg:flex">
                <button
                    type="button"
                    onClick={() => setCommandOpen(true)}
                    className="flex w-full max-w-md items-center gap-3 rounded-md border border-border/60 bg-muted/50 px-3 py-2 text-sm text-muted-foreground shadow-sm transition hover:bg-muted"
                >
                    <Search className="h-4 w-4" />
                    <span className="truncate">搜索审批、人员或操作...</span>
                    <span className="ml-auto text-xs text-muted-foreground">Ctrl + K</span>
                </button>
            </div>

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
                        <Button variant="ghost" size="icon" className="rounded-full border border-input overflow-hidden">
                            {user?.avatar ? (
                                <img
                                    src={getFileDownloadUrl(user.avatar)}
                                    alt={user.username || "User avatar"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <User className="h-5 w-5" />
                            )}
                            <span className="sr-only">User Menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
            <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
        </header>
    )
}

