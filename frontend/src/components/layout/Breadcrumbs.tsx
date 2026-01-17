/**
 * 面包屑导航组件
 *
 * 根据当前路由路径自动生成面包屑导航。
 */

import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

// 路由路径到名称的映射
const routeNameMap: Record<string, string> = {
    dashboard: '仪表盘',
    approval: '审批管理',
    new: '发起审批',
    admin: '系统管理',
    users: '成员管理',
    workflows: '流程配置',
    profile: '个人资料',
    notifications: '消息通知',
    list: '审批列表',
    departments: '部门管理',
    'approval-types': '审批类型管理',
    logs: '操作日志',
}

export function Breadcrumbs() {
    const location = useLocation()
    const pathnames = location.pathname.split('/').filter((x) => x)

    return (
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
            <Link
                to="/dashboard"
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4 mr-1" />
                <span className="sr-only">首页</span>
            </Link>

            {pathnames.length > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
            )}

            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`
                const isLast = index === pathnames.length - 1

                // 尝试获取映射名称，如果没有则显示原值（首字母大写）
                const name = routeNameMap[value] || value

                return (
                    <div key={to} className="flex items-center">
                        {isLast ? (
                            <span className="font-medium text-foreground cursor-default">
                                {name}
                            </span>
                        ) : (
                            <Link
                                to={to}
                                className="hover:text-foreground transition-colors"
                            >
                                {name}
                            </Link>
                        )}

                        {!isLast && (
                            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
