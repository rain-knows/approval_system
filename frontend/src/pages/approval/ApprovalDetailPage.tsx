import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';

export default function ApprovalDetailPage() {
    const { id } = useParams();

    return (
        <PageContainer
            title={`审批详情 #${id || 'Loading'}`}
            description="查看申请详情与流转记录。"
            action={
                <div className="flex gap-2">
                    <Button variant="destructive" className="clickable">驳回</Button>
                    <Button className="clickable bg-green-600 hover:bg-green-700">同意</Button>
                </div>
            }
        >
            <div className="grid gap-6 lg:grid-cols-4">
                {/* 左侧详情 */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="interactive-card p-6 min-h-100">
                        <h3 className="font-semibold mb-4">申请内容</h3>
                        <p className="text-muted-foreground">加载中...</p>
                    </div>
                </div>

                {/* 右侧流程 */}
                <div className="lg:col-span-1">
                    <div className="interactive-card p-4">
                        <h4 className="font-medium mb-4">流转记录</h4>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 text-sm">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary/20 shrink-0" />
                                    <div>
                                        <p className="font-medium">发起申请</p>
                                        <p className="text-muted-foreground text-xs">2026-01-13 10:00</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
