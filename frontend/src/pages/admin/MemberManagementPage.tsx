import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';

export default function MemberManagementPage() {
    return (
        <PageContainer
            title="成员管理"
            description="管理组织架构与成员权限。"
            action={<Button className="clickable">邀请成员</Button>}
        >
            <div className="interactive-card overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <div className="flex gap-4">
                        {/* 简单的过滤器占位 */}
                        <div className="h-9 w-48 bg-background border rounded-md" />
                    </div>
                </div>
                <div className="p-8 text-center text-muted-foreground">
                    <p>成员列表加载中...</p>
                    {/* 将来这里会是 Data Table */}
                </div>
            </div>
        </PageContainer>
    );
}
