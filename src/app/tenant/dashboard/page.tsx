'use client';
import Card from 'components/card';
import { useApi } from 'lib/useApi';

type Me = { member: { email: string; role: string }; tenant: { id: string; name: string } };

export default function TenantDashboard() {
  const { data } = useApi<Me | null>('/api/tenant/me', null);
  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <Card extra="w-full px-6 py-6">
        <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
          欢迎,{data?.tenant?.name || '租户'}
        </h4>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          在这里管理你的应用、生成邀请码把微信用户绑定到你的 app、查看绑定与用量。
          左侧导航开始:My Apps → 建应用并配置 webhook;Invite Codes → 生成邀请码。
        </p>
      </Card>
    </div>
  );
}
