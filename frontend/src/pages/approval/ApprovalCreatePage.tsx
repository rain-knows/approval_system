import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';

export default function ApprovalCreatePage() {
    return (
        <PageContainer
            title="发起审批"
            description="选择模版并填写申请详情。"
        >
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="interactive-card p-6">
                    <h3 className="text-lg font-medium mb-4">基本信息</h3>
                    <div className="grid gap-4">
                        <div className="h-10 border rounded-md bg-muted/10 w-full" />
                        <div className="h-10 border rounded-md bg-muted/10 w-full" />
                    </div>
                </div>

                <div className="interactive-card p-6 border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer items-center justify-center flex flex-col py-12">
                    <p className="font-medium">点击或拖拽上传附件</p>
                    <p className="text-sm text-muted-foreground">支持 PDF, Word, Excel</p>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" className="clickable">取消</Button>
                    <Button className="clickable">提交申请</Button>
                </div>
            </div>
        </PageContainer>
    );
}
