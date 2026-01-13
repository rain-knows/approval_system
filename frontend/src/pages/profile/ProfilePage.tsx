import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    return (
        <PageContainer
            title="个人中心"
            description="管理您的个人账户信息与偏好设置。"
            action={<Button variant="outline" className="clickable">编辑资料</Button>}
        >
            <div className="grid gap-6 md:grid-cols-2">
                <div className="interactive-card p-6">
                    <h3 className="font-semibold mb-4">基本信息</h3>
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p>头像与昵称设置区域（开发中）</p>
                    </div>
                </div>
                <div className="interactive-card p-6">
                    <h3 className="font-semibold mb-4">账号安全</h3>
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p>密码修改与双重认证（开发中）</p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
