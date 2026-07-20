'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from 'components/card';
import DataTable, { SimpleColumn } from 'components/console/DataTable';
import StatusBadge from 'components/console/StatusBadge';

type App = { id: string; name: string };
type Invite = { id: string; appId: string; label?: string; status: string; usedCount: number; maxUses?: number; createdAt: string };

const selectCls =
  'h-12 w-full rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:!border-white/10 dark:text-white dark:[&>option]:bg-navy-800';

export default function TenantInvitesPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appId, setAppId] = useState('');
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [newCode, setNewCode] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [a, i] = await Promise.all([fetch('/api/tenant/apps'), fetch('/api/tenant/invites')]);
      if (!a.ok || !i.ok) throw new Error('加载失败');
      setApps(await a.json());
      setInvites(await i.json());
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

  const generate = async () => {
    if (!appId) return;
    setBusy(true);
    setNewCode('');
    try {
      const res = await fetch('/api/tenant/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, label: label.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNewCode(data.rawCode);
      setLabel('');
      await load();
    } catch {
      setError('生成邀请码失败');
    } finally {
      setBusy(false);
    }
  };

  const columns: SimpleColumn<Invite>[] = [
    { key: 'appId', header: 'App', render: (r) => <span className="text-sm text-navy-700 dark:text-white">{appName[r.appId] || r.appId}</span> },
    { key: 'label', header: '标签', render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{r.label || '—'}</span> },
    { key: 'status', header: '状态', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'usedCount', header: '已用/上限', render: (r) => <span className="text-sm text-navy-700 dark:text-white">{r.usedCount}{r.maxUses ? ` / ${r.maxUses}` : ''}</span> },
    { key: 'createdAt', header: '创建时间', render: (r) => <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(r.createdAt).toLocaleString()}</span> },
  ];

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <Card extra="w-full px-6 py-5">
        <h4 className="mb-1 text-lg font-bold text-navy-700 dark:text-white">生成邀请码</h4>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          把邀请码发给微信用户,用户在你的 bot 里发 <span className="font-mono">/bind &lt;邀请码&gt;</span> 即可绑定到该 app。
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="ml-1 text-sm font-medium text-navy-700 dark:text-white">选择 App</label>
            <select className={`mt-2 ${selectCls}`} value={appId} onChange={(e) => setAppId(e.target.value)}>
              <option value="">选择 app…</option>
              {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="ml-1 text-sm font-medium text-navy-700 dark:text-white">标签(可选)</label>
            <input className={`mt-2 ${selectCls}`} placeholder="例如:官网渠道" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button onClick={generate} disabled={busy || !appId}
              className="linear h-12 w-full rounded-xl bg-brand-500 px-6 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-brand-400">
              生成
            </button>
          </div>
        </div>
        {newCode && (
          <div className="mt-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 dark:border-green-500/30 dark:bg-green-500/10">
            <p className="text-xs text-green-700 dark:text-green-400">邀请码已生成(仅显示一次,请复制保存):</p>
            <p className="mt-1 font-mono text-lg font-bold text-green-700 dark:text-green-300">{newCode}</p>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </Card>

      <DataTable<Invite>
        title="邀请码"
        columns={columns}
        data={invites}
        loading={loading}
        emptyText="还没有邀请码。"
      />
    </div>
  );
}
