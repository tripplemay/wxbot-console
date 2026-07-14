'use client';
import DataTable, { SimpleColumn } from 'components/console/DataTable';
import StatusBadge from 'components/console/StatusBadge';
import { useApi } from 'lib/useApi';

type DeliveryLog = {
  id: string;
  eventId: string;
  appId: string;
  endpointId: string;
  attempt: number;
  status: string;
  httpStatus?: number;
  error?: string;
  durationMs?: number;
  createdAt: string;
};

export default function DeliveryLogsPage() {
  const { data, loading, error } = useApi<DeliveryLog[]>('/api/platform/delivery-logs', []);

  const columns: SimpleColumn<DeliveryLog>[] = [
    { key: 'status', header: '状态', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'appId', header: 'App', render: (r) => <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{r.appId}</span> },
    { key: 'attempt', header: '尝试', render: (r) => <span className="text-sm text-navy-700 dark:text-white">#{r.attempt}</span> },
    { key: 'httpStatus', header: 'HTTP', render: (r) => <span className="text-sm text-navy-700 dark:text-white">{r.httpStatus ?? '—'}</span> },
    { key: 'durationMs', header: '耗时', render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{r.durationMs != null ? `${r.durationMs}ms` : '—'}</span> },
    { key: 'error', header: '错误', render: (r) => <span className="text-xs text-red-500 dark:text-red-400">{r.error ?? ''}</span> },
    { key: 'createdAt', header: '时间', render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(r.createdAt).toLocaleString()}</span> },
  ];

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <DataTable<DeliveryLog>
        title="Webhook 投递日志"
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        emptyText="暂无投递记录。"
      />
    </div>
  );
}
