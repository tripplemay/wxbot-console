'use client';
import { useCallback, useEffect, useState } from 'react';
import Card from 'components/card';
import InputField from 'components/fields/InputField';
import DataTable, { SimpleColumn } from 'components/console/DataTable';
import StatusBadge from 'components/console/StatusBadge';

type App = {
  id: string;
  name: string;
  runtimeType: 'webhook' | 'sdk' | 'openclaw-agent';
  status: 'active' | 'disabled';
  createdAt: string;
};
type Webhook = { id: string; url: string; secretRef: string; enabled: boolean };

const RUNTIMES = ['webhook', 'sdk', 'openclaw-agent'];
const selectCls =
  'mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:!border-white/10 dark:text-white dark:[&>option]:bg-navy-800';

export default function TenantAppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [runtimeType, setRuntimeType] = useState('webhook');
  const [showForm, setShowForm] = useState(false);

  const [selApp, setSelApp] = useState<App | null>(null);
  const [hooks, setHooks] = useState<Webhook[]>([]);
  const [hookUrl, setHookUrl] = useState('');
  const [hookSecret, setHookSecret] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tenant/apps');
      if (!res.ok) throw new Error(`加载失败 (${res.status})`);
      setApps(await res.json());
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const createApp = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/tenant/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), runtimeType }),
      });
      if (!res.ok) throw new Error();
      setName('');
      setShowForm(false);
      await load();
    } catch {
      setError('创建 app 失败');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (a: App) => {
    setBusy(true);
    try {
      await fetch(`/api/tenant/apps/${a.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: a.status === 'active' ? 'disabled' : 'active' }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const openWebhooks = async (a: App) => {
    setSelApp(a);
    setHooks([]);
    setHookUrl('');
    setHookSecret('');
    try {
      const res = await fetch(`/api/tenant/webhooks?appId=${a.id}`);
      if (res.ok) setHooks(await res.json());
    } catch {}
  };

  const addWebhook = async () => {
    if (!selApp) return;
    setBusy(true);
    try {
      const res = await fetch('/api/tenant/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: selApp.id, url: hookUrl.trim(), secretRef: hookSecret.trim() || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.error || '配置 webhook 失败');
      } else {
        setHookUrl('');
        await openWebhooks(selApp);
      }
    } finally {
      setBusy(false);
    }
  };

  const columns: SimpleColumn<App>[] = [
    { key: 'name', header: 'App', render: (a) => <p className="text-sm font-bold text-navy-700 dark:text-white">{a.name}</p> },
    { key: 'runtimeType', header: 'Runtime', render: (a) => <span className="rounded-full bg-lightPrimary px-3 py-1 text-xs font-medium text-brand-500 dark:bg-navy-700 dark:text-white">{a.runtimeType}</span> },
    { key: 'status', header: '状态', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'id', header: 'App ID', render: (a) => <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{a.id}</span>,
    },
    {
      key: 'actions', header: '操作', sortable: false,
      render: (a) => (
        <div className="flex gap-2">
          {a.runtimeType === 'webhook' && (
            <button onClick={() => openWebhooks(a)} className="rounded-lg bg-lightPrimary px-3 py-1 text-xs font-medium text-brand-500 hover:opacity-80 dark:bg-navy-700 dark:text-white">
              Webhook
            </button>
          )}
          <button onClick={() => toggle(a)} disabled={busy}
            className={`rounded-lg px-3 py-1 text-xs font-medium disabled:opacity-50 ${a.status === 'active' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
            {a.status === 'active' ? '停用' : '启用'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      {showForm && (
        <div className="rounded-[20px] bg-white px-6 py-5 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField id="app-name" label="App 名称" placeholder="例如:客服助手" value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
            <div>
              <label className="ml-1.5 text-sm font-medium text-navy-700 dark:text-white">Runtime</label>
              <select className={selectCls} value={runtimeType} onChange={(e) => setRuntimeType(e.target.value)}>
                {RUNTIMES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={createApp} disabled={busy || !name.trim()}
              className="linear rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-brand-400">
              创建 App
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700">取消</button>
          </div>
        </div>
      )}

      <DataTable<App>
        title="My Apps"
        columns={columns}
        data={apps}
        loading={loading}
        error={error}
        emptyText="还没有 app,点击右上角新建。"
        toolbar={!showForm ? (
          <button onClick={() => setShowForm(true)} className="linear rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-400">
            + 新建 App
          </button>
        ) : null}
      />

      {selApp && (
        <Card extra="w-full px-6 py-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-lg font-bold text-navy-700 dark:text-white">Webhook 配置 · {selApp.name}</h4>
            <button onClick={() => setSelApp(null)} className="text-sm text-gray-500 hover:text-gray-700">关闭</button>
          </div>
          {hooks.length > 0 ? (
            <ul className="mb-4 flex flex-col gap-2">
              {hooks.map((h) => (
                <li key={h.id} className="rounded-xl bg-lightPrimary px-4 py-2 text-sm dark:bg-navy-700">
                  <span className="font-medium text-navy-700 dark:text-white">{h.url}</span>
                  <span className="ml-3 text-xs text-gray-500">secretRef: {h.secretRef}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">尚未配置 webhook。</p>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InputField id="hook-url" label="Webhook URL" placeholder="https://your.app/webhook" value={hookUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHookUrl(e.target.value)} />
            <InputField id="hook-secret" label="签名 secretRef(可选,默认按 app 生成)" placeholder={`app_${selApp.id}`} value={hookSecret}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHookSecret(e.target.value)} />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            secretRef 指向平台侧解析的签名密钥(env/Vault 由运营方置备)。事件以 HMAC-SHA256 签名,请在你的服务端校验。
          </p>
          <button onClick={addWebhook} disabled={busy || !hookUrl.trim()}
            className="linear mt-3 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-brand-400">
            保存 Webhook
          </button>
        </Card>
      )}
    </div>
  );
}
