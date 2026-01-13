import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
    return (
        <PageContainer
            title="消息通知"
            description="查看系统通知与待办事项。"
            action={<Button variant="ghost" className="clickable">全部标记为已读</Button>}
        >
            <div className="space-y-4">
                <div className="interactive-card p-4 flex items-start gap-4">
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                    <div>
                        <h4 className="font-medium">欢迎使用新版审批系统</h4>
                        <p className="text-sm text-muted-foreground mt-1">系统已升级，新增了更流畅的交互体验。</p>
                        <p className="text-xs text-muted-foreground mt-2">10分钟前</p>
                    </div>
                </div>
                {/* Placeholder for empty state */}
                <div className="text-center py-12 text-muted-foreground">
                    没有更多新消息
                </div>
            </div>
        </PageContainer>
    );
}
