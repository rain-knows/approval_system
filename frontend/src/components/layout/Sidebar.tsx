/**
 * 侧边栏组件
 *
 * 负责应用的主导航。
 * 使用 Shadcn UI Sheet 组件实现抽屉效果（Desktop & Mobile）。
 */

import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    LogOut,
    PlusSquare,
    Inbox,
    CheckCircle2,
    Building2,
    Users,
    ClipboardList,
    Settings,
    ScrollText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useAuthStore } from '@/stores/authStore'
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetHeader,
    SheetDescription,
} from "@/components/ui/sheet"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'


interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const { pathname } = useLocation()
    const { isOpen, setOpen } = useSidebarStore()
    const { logout, user } = useAuthStore()

    const navItems = [
        {
            href: '/approval/new',
            label: '发起',
            icon: PlusSquare,
            match: '/approval/new',
        },
        {
            href: '/approval?tab=todo',
            label: '待办',
            icon: Inbox,
            match: '/approval',
        },
        {
            href: '/approval?tab=done',
            label: '已办',
            icon: CheckCircle2,
            match: '/approval',
        },
        {
            href: '/dashboard',
            label: '数据看板',
            icon: LayoutDashboard,
            match: '/dashboard',
        },
    ]

    const adminItems = [
        {
            href: '/admin/departments',
            label: '部门',
            icon: Building2,
            match: '/admin/departments',
        },
        {
            href: '/admin/users',
            label: '成员',
            icon: Users,
            match: '/admin/users',
        },
        {
            href: '/admin/approval-types',
            label: '类型',
            icon: ClipboardList,
            match: '/admin/approval-types',
        },
        {
            href: '/admin/workflows',
            label: '流程',
            icon: Settings,
            match: '/admin/workflows',
        },
        {
            href: '/admin/logs',
            label: '日志',
            icon: ScrollText,
            match: '/admin/logs',
        },
    ]

    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

    // 侧边栏内容
    const SidebarContent = (
        <div className="h-full flex flex-col">
            {/* Logo 区域 */}
            <div className="h-16 flex items-center justify-center border-b">
                <Link to="/" className="flex items-center justify-center font-bold text-lg" onClick={() => setOpen(false)}>
                    <span className="text-primary">AS</span>
                </Link>
            </div>

            {/* 导航菜单 */}
            <div className="flex-1 py-6 overflow-y-auto">
                <nav className="flex flex-col items-center gap-3">
                    {navItems.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname.startsWith(link.match)

                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                title={link.label}
                                className={cn(
                                    'flex h-11 w-11 items-center justify-center rounded-xl border transition-colors',
                                    isActive
                                        ? 'border-primary/50 bg-primary/15 text-primary'
                                        : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                )}
                                onClick={() => setOpen(false)}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="sr-only">{link.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {isAdmin && (
                <div className="py-4 border-t">
                    <nav className="flex flex-col items-center gap-3">
                        {adminItems.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname.startsWith(link.match)

                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    title={link.label}
                                    className={cn(
                                        'flex h-11 w-11 items-center justify-center rounded-xl border transition-colors',
                                        isActive
                                            ? 'border-primary/50 bg-primary/15 text-primary'
                                            : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                    )}
                                    onClick={() => setOpen(false)}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="sr-only">{link.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            )}

            {/* 底部信息 */}
            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => {
                        logout();
                        setOpen(false);
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">退出登录</span>
                </Button>
            </div>
        </div>
    )

    return (
        <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetContent side="left" className={cn("p-0 w-16 border-r bg-background/85 backdrop-blur", className)}>
                <SheetHeader>
                    <VisuallyHidden>
                        <SheetTitle>导航菜单</SheetTitle>
                        <SheetDescription>主要应用导航链接</SheetDescription>
                    </VisuallyHidden>
                </SheetHeader>
                {SidebarContent}
            </SheetContent>
        </Sheet>
    )
}
