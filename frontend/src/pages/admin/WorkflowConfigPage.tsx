import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';

export default function WorkflowConfigPage() {
    return (
        <PageContainer
            title="审批流程配置"
            description="设计与管理业务审批流模版。"
            action={<Button className="clickable">新建流程</Button>}
        >
            <div className="grid gap-6 md:grid-cols-3">
                {/* 模版卡片示例 */}
                {['请假申请', '报销审批', '采购申请'].map((item) => (
                    <div key={item} className="interactive-card p-6 cursor-pointer flex flex-col justify-between h-40">
                        <div>
                            <h3 className="font-semibold text-lg">{item}</h3>
                            <p className="text-xs text-muted-foreground mt-1">最后更新: 2026-01-13</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">已启用</span>
                        </div>
                    </div>
                ))}
                {/* 新建卡片 */}
                <div className="border border-dashed border-muted-foreground/25 rounded-xl p-6 flex items-center justify-center h-40 hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                    + 创建新模版
                </div>
            </div>
        </PageContainer>
    );
}
