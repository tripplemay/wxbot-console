'use client';
import MiniStatistics from 'components/card/MiniStatistics';
import DataTable, { SimpleColumn } from 'components/console/DataTable';
import { useApi } from 'lib/useApi';
import { MdInbox, MdOutlineSend, MdSend, MdPayments } from 'react-icons/md';

type Billing = {
  totalQuantity: number;
  byKind: Record<string, number>;
  byApp: Record<string, number>;
};

export default function TenantUsagePage() {
  const { data, loading, error } = useApi<Billing | null>('/api/tenant/usage', null);
  const byApp = data ? Object.entries(data.byApp).map(([appId, quantity]) => ({ appId, quantity })) : [];

  const columns: SimpleColumn<{ appId: string; quantity: number }>[] = [
    { key: 'appId', header: 'App', render: (r) => <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{r.appId}</span> },
    { key: 'quantity', header: '用量', render: (r) => <span className="text-sm font-bold text-navy-700 dark:text-white">{r.quantity}</span> },
  ];

  const kind = (k: string) => (data?.byKind?.[k] ?? 0);

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MiniStatistics name="总用量" value={loading ? '…' : String(data?.totalQuantity ?? 0)} iconBg="bg-lightPrimary dark:bg-navy-700" icon={<MdPayments className="h-7 w-7" />} />
        <MiniStatistics name="事件" value={String(kind('event'))} iconBg="bg-lightPrimary dark:bg-navy-700" icon={<MdInbox className="h-7 w-7" />} />
        <MiniStatistics name="Webhook 投递" value={String(kind('webhook-delivery'))} iconBg="bg-lightPrimary dark:bg-navy-700" icon={<MdOutlineSend className="h-7 w-7" />} />
        <MiniStatistics name="Bot API 发送" value={String(kind('bot-api-send'))} iconBg="bg-lightPrimary dark:bg-navy-700" icon={<MdSend className="h-7 w-7" />} />
      </div>
      {error && <p className="text-sm text-red-500">无法加载用量:{error}</p>}
      <DataTable<{ appId: string; quantity: number }>
        title="按 App 用量"
        columns={columns}
        data={byApp}
        loading={loading}
        emptyText="暂无用量记录。"
      />
    </div>
  );
}
