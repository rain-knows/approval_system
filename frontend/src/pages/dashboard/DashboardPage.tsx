/**
 * 仪表盘页面组件
 *
 * 展示用户欢迎信息、待处理审批统计和快捷操作入口。
 */

import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import dashboardService, { type RecentActivity } from '@/services/dashboardService'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { motion } from 'framer-motion'


/**
 * 仪表盘页面
 *
 * 返回：仪表盘页面组件
 */
export default function DashboardPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [activities, setActivities] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)

    // 加载数据
    useEffect(() => {
        loadData()
    }, [])

    /**
     * 加载仪表盘数据
     */
    const loadData = async () => {
        try {
            setLoading(true)
            const activitiesData = await dashboardService.getRecentActivities(5)
            setActivities(activitiesData)
        } catch (error) {
            console.error('加载数据失败:', error)
            toast.error('加载数据失败')
        } finally {
            setLoading(false)
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0 }
    }

    const listVariants = {
        hidden: {},
        show: {
            transition: { staggerChildren: 0.08 }
        }
    }

    const AnimatedNumber = ({ value, duration = 1.2 }: { value: number; duration?: number }) => {
        const [display, setDisplay] = useState(0)
        useEffect(() => {
            const start = performance.now()
            const from = 0
            const change = value - from
            const d = duration * 1000
            let raf = 0
            const tick = (now: number) => {
                const p = Math.min((now - start) / d, 1)
                const eased = 1 - Math.pow(1 - p, 3)
                setDisplay(Math.round(from + change * eased))
                if (p < 1) raf = requestAnimationFrame(tick)
            }
            raf = requestAnimationFrame(tick)
            return () => cancelAnimationFrame(raf)
        }, [value, duration])
        return <span>{display}</span>
    }

    return (
        <div className="min-h-screen bg-background">

            {/* 主内容区 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 欢迎区域 - 仿 awwwards.com 风格 */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 to-secondary/10 p-8 md:p-12"
                >
                    {/* 背景装饰元素 */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
                    
                    {/* Blob 动画效果 */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
                        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
                    </div>
                    
                    <div className="relative z-10">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary mb-8">
                            欢迎回来，{user?.username || '用户'}！
                        </h1>
                        <p className="text-lg text-muted-foreground whitespace-nowrap overflow-x-auto">
                            发现、创建和管理您的审批流程。在这里，您可以轻松跟踪、审批和协作处理各种事务。
                        </p>
                        
                        <div className="mt-6 flex flex-wrap gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button 
                                    onClick={() => navigate('/approval/new')}
                                    className="rounded-full px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    创建新审批
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button 
                                    variant="outline"
                                    onClick={() => navigate('/approval')}
                                    className="rounded-full px-6 py-2"
                                >
                                    查看全部
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>


                {/* 最近活动（在欢迎区域下方） */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>最近活动</CardTitle>
                            <CardDescription>您的最新操作记录</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-48 overflow-y-auto space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 animate-pulse">
                                            <div className="w-2 h-2 rounded-full bg-muted" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-muted rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : activities.length > 0 ? (
                                <motion.div
                                    className="h-48 overflow-y-auto space-y-4 pr-2"
                                    variants={listVariants}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {activities.map((activity) => (
                                        <motion.div
                                            key={activity.approvalId}
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.01 }}
                                            className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                                            onClick={() => navigate(`/approval/${activity.approvalId}`)}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${
                                                activity.activityType === 'approved' ? 'bg-green-500' :
                                                activity.activityType === 'rejected' ? 'bg-red-500' :
                                                activity.activityType === 'withdrawn' ? 'bg-gray-500' :
                                                'bg-blue-500'
                                            }`} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {activity.activityType === 'approved' ? '已通过' :
                                                     activity.activityType === 'rejected' ? '已拒绝' :
                                                     activity.activityType === 'withdrawn' ? '已撤回' :
                                                     '已提交'} - {activity.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{activity.relativeTime}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-center text-muted-foreground">
                                    <p>暂无活动记录</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
