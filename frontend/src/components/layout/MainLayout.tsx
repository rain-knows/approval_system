/**
 * 主布局组件
 *
 * 包装所有受保护的页面，提供统一的 Sidebar 和 Header 结构。
 */

import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function MainLayout() {
    return (
        <div className="flex min-h-screen font-sans antialiased app-gradient">
            {/* 侧边栏 */}
            <Sidebar />

            {/* 主要内容区域 */}
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
                <Header />

                <main className="flex-1 p-4 lg:p-6 overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
