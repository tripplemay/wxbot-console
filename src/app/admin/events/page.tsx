'use client';
import DataTable, { SimpleColumn } from 'components/console/DataTable';
import { useApi } from 'lib/useApi';

type StoredEvent = {
  event: {
    id: string;
    type: string;
    accountId: string;
    externalUserId: string;
    appId?: string;
    text?: string;
    timestamp?: string;
  };
  receivedAt: string;
};

export default function EventsPage() {
  const { data, loading, error } = useApi<StoredEvent[]>('/api/platform/events', []);

  const columns: SimpleColumn<StoredEvent>[] = [
    { key: 'type', header: '类型', render: (r) => <span className="rounded-full bg-lightPrimary px-3 py-1 text-xs font-medium text-brand-500 dark:bg-navy-700 dark:text-white">{r.event.type}</span> },
    { key: 'appId', header: 'App', render: (r) => <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{r.event.appId ?? '—'}</span> },
    { key: 'externalUserId', header: '用户', render: (r) => <span className="text-sm text-navy-700 dark:text-white">{r.event.externalUserId}</span> },
    { key: 'text', header: '内容', render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{(r.event.text ?? '').slice(0, 60) || '—'}</span> },
    { key: 'receivedAt', header: '接收时间', render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(r.receivedAt).toLocaleString()}</span> },
  ];

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <DataTable<StoredEvent>
        title="事件浏览器"
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        emptyText="暂无事件。"
      />
    </div>
  );
}
