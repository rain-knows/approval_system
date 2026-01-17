/**
 * 侧边栏组件
 *
 * 负责应用的主导航。
 * 使用 Shadcn UI Sheet 组件实现抽屉效果（Desktop & Mobile）。
 */

import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    FileText,
    LogOut,
    User,
    ClipboardList,
    Users,
    Settings,
    Building2,
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

    const links = [
        {
            title: '核心功能',
            items: [
                {
                    href: '/dashboard',
                    label: '仪表盘',
                    icon: LayoutDashboard,
                },
                {
                    href: '/notifications',
                    label: '消息通知',
                    icon: FileText, // 暂时用FileText，如果有Bell更好
                },
                {
                    href: '/profile',
                    label: '个人资料',
                    icon: User,
                },
            ]
        },
        {
            title: '审批管理',
            items: [
                {
                    href: '/approval',
                    label: '审批列表',
                    icon: FileText,
                },
                {
                    href: '/approval/new',
                    label: '发起审批',
                    icon: ClipboardList,
                },
            ]
        },
        {
            title: '系统管理',
            role: 'admin', // 仅管理员可见
            items: [
                {
                    href: '/admin/departments',
                    label: '部门管理',
                    icon: Building2,
                },
                {
                    href: '/admin/users',
                    label: '成员管理',
                    icon: Users,
                },
                {
                    href: '/admin/approval-types',
                    label: '审批类型',
                    icon: ClipboardList,
                },
                {
                    href: '/admin/workflows',
                    label: '流程配置',
                    icon: Settings,
                },
                {
                    href: '/admin/logs',
                    label: '操作日志',
                    icon: ScrollText,
                },
            ]
        }
    ]

    // 侧边栏内容
    const SidebarContent = (
        <div className="h-full flex flex-col">
            {/* Logo 区域 */}
            <div className="h-16 flex items-center px-6 border-b">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setOpen(false)}>
                    <span className="text-primary">Approval</span>System
                </Link>
            </div>

            {/* 导航菜单 */}
            <div className="flex-1 py-6 px-4 overflow-y-auto">
                <nav className="space-y-6">
                    {links.map((group, index) => {
                        // 角色检查：superadmin 拥有 admin 的所有权限
                        // 如果组有 role='admin' 属性，则 admin 和 superadmin 都可以访问
                        if (group.role === 'admin' && user?.role !== 'admin' && user?.role !== 'superadmin') {
                            return null
                        }

                        return (
                            <div key={index} className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground px-3">
                                    {group.title}
                                </h4>
                                {group.items.map((link) => {
                                    const Icon = link.icon
                                    const isActive = pathname === link.href

                                    return (
                                        <Link
                                            key={link.href}
                                            to={link.href}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                            )}
                                            onClick={() => setOpen(false)}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {link.label}
                                        </Link>
                                    )
                                })}
                            </div>
                        )
                    })}
                </nav>
            </div>

            {/* 底部信息 */}
            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => {
                        logout();
                        setOpen(false);
                    }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                </Button>
            </div>
        </div>
    )

    return (
        <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetContent side="left" className={cn("p-0 w-64 border-r", className)}>
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
