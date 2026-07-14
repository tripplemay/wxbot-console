'use client';
import DataTable, { SimpleColumn } from 'components/console/DataTable';
import StatusBadge from 'components/console/StatusBadge';
import { useApi } from 'lib/useApi';

type ChannelHealth = {
  id: string;
  platform: string;
  accountId: string;
  status: string;
  message?: string;
  checkedAt: string;
};

export default function HealthPage() {
  const { data, loading, error } = useApi<ChannelHealth[]>('/api/platform/channel-health', []);

  const columns: SimpleColumn<ChannelHealth>[] = [
    { key: 'accountId', header: '账号', render: (r) => <span className="text-sm font-bold text-navy-700 dark:text-white">{r.accountId}</span> },
    { key: 'platform', header: '渠道', render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{r.platform}</span> },
    { key: 'status', header: '状态', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'message', header: '说明', render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{r.message ?? '—'}</span> },
    { key: 'checkedAt', header: '检查时间', render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(r.checkedAt).toLocaleString()}</span> },
  ];

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <DataTable<ChannelHealth>
        title="渠道健康"
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        emptyText="暂无渠道健康快照。"
      />
    </div>
  );
}
