/**
 * 顶部导航栏组件
 *
 * 包含侧边栏切换按钮和用户个人信息。
 */

import { Menu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useAuthStore } from '@/stores/authStore'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function Header() {
    const { toggle } = useSidebarStore()
    const { user, logout } = useAuthStore()

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

            <div className="flex flex-1 items-center justify-end gap-4">
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
                        {/* <DropdownMenuItem>个人中心</DropdownMenuItem> */}
                        {/* <DropdownMenuItem>设置</DropdownMenuItem> */}
                        {/* <DropdownMenuSeparator /> */}
                        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                            退出登录
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
