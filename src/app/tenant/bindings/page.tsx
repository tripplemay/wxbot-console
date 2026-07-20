'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable, { SimpleColumn } from 'components/console/DataTable';
import StatusBadge from 'components/console/StatusBadge';

type App = { id: string; name: string };
type Binding = {
  id: string;
  appId: string;
  accountId: string;
  externalUserId: string;
  displayName?: string;
  status: string;
  isDefault: boolean;
  boundAt?: string;
};

export default function TenantBindingsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [a, b] = await Promise.all([fetch('/api/tenant/apps'), fetch('/api/tenant/bindings')]);
      if (!a.ok || !b.ok) throw new Error('加载失败');
      setApps(await a.json());
      setBindings(await b.json());
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const appName = useMemo(() => Object.fromEntries(apps.map((a) => [a.id, a.name])), [apps]);

  const columns: SimpleColumn<Binding>[] = [
    { key: 'appId', header: 'App', render: (b) => <span className="text-sm font-bold text-navy-700 dark:text-white">{appName[b.appId] || b.appId}</span> },
    { key: 'externalUserId', header: '微信用户', render: (b) => <span className="text-sm text-navy-700 dark:text-white">{b.displayName || b.externalUserId}</span> },
    { key: 'accountId', header: 'Bot 账号', render: (b) => <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{b.accountId}</span> },
    { key: 'status', header: '状态', render: (b) => <StatusBadge status={b.status} /> },
    { key: 'isDefault', header: '默认', render: (b) => <span className="text-sm text-gray-600 dark:text-gray-400">{b.isDefault ? '是' : '—'}</span> },
    { key: 'boundAt', header: '绑定时间', render: (b) => <span className="text-sm text-gray-600 dark:text-gray-400">{b.boundAt ? new Date(b.boundAt).toLocaleString() : '—'}</span> },
  ];

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <DataTable<Binding>
        title="绑定用户"
        columns={columns}
        data={bindings}
        loading={loading}
        error={error}
        emptyText="还没有用户绑定。生成邀请码并让用户在 bot 里 /bind 即可。"
      />
    </div>
  );
}
