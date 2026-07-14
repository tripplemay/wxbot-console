'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import InputField from 'components/fields/InputField';
import DataTable, { SimpleColumn } from 'components/console/DataTable';
import StatusBadge from 'components/console/StatusBadge';

type Tenant = { id: string; name: string; status: string };
type Workspace = { id: string; tenantId: string; name: string; status: string };
type App = {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: string;
  runtimeType: 'webhook' | 'sdk' | 'openclaw-agent';
  status: 'active' | 'disabled';
  createdAt: string;
};

const RUNTIMES = ['webhook', 'sdk', 'openclaw-agent'];
const selectCls =
  'mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:!border-white/10 dark:text-white dark:[&>option]:bg-navy-800';

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // create-form state
  const [tenantId, setTenantId] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [appName, setAppName] = useState('');
  const [runtimeType, setRuntimeType] = useState('webhook');
  const [newWsName, setNewWsName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [a, t, w] = await Promise.all([
        fetch('/api/apps'),
        fetch('/api/tenants'),
        fetch('/api/workspaces'),
      ]);
      if (!a.ok || !t.ok || !w.ok) throw new Error('加载失败');
      setApps(await a.json());
      setTenants(await t.json());
      setWorkspaces(await w.json());
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tenantName = useMemo(
    () => Object.fromEntries(tenants.map((t) => [t.id, t.name])),
    [tenants],
  );
  const workspaceName = useMemo(
    () => Object.fromEntries(workspaces.map((w) => [w.id, w.name])),
    [workspaces],
  );
  const tenantWorkspaces = useMemo(
    () => workspaces.filter((w) => w.tenantId === tenantId),
    [workspaces, tenantId],
  );

  const createWorkspace = async () => {
    if (!tenantId || !newWsName.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, name: newWsName.trim() }),
      });
      if (!res.ok) throw new Error();
      const ws = await res.json();
      setNewWsName('');
      await load();
      setWorkspaceId(ws.id);
    } catch {
      setError('创建 workspace 失败');
    } finally {
      setBusy(false);
    }
  };

  const createApp = async () => {
    if (!tenantId || !workspaceId || !appName.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, workspaceId, name: appName.trim(), runtimeType }),
      });
      if (!res.ok) throw new Error();
      setShowForm(false);
      setAppName('');
      setWorkspaceId('');
      setTenantId('');
      await load();
    } catch {
      setError('创建 app 失败');
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (app: App) => {
    const next = app.status === 'active' ? 'disabled' : 'active';
    setBusy(true);
    try {
      const res = await fetch(`/api/apps/${app.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError('更新状态失败');
    } finally {
      setBusy(false);
    }
  };

  const columns: SimpleColumn<App>[] = [
    {
      key: 'name',
      header: 'App',
      render: (a) => <p className="text-sm font-bold text-navy-700 dark:text-white">{a.name}</p>,
    },
    { key: 'tenantId', header: '租户', render: (a) => <span className="text-sm text-navy-700 dark:text-white">{tenantName[a.tenantId] ?? a.tenantId}</span> },
    { key: 'workspaceId', header: 'Workspace', render: (a) => <span className="text-sm text-gray-600 dark:text-gray-400">{workspaceName[a.workspaceId] ?? a.workspaceId}</span> },
    {
      key: 'runtimeType',
      header: 'Runtime',
      render: (a) => (
        <span className="rounded-full bg-lightPrimary px-3 py-1 text-xs font-medium text-brand-500 dark:bg-navy-700 dark:text-white">
          {a.runtimeType}
        </span>
      ),
    },
    { key: 'status', header: '状态', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'actions',
      header: '操作',
      sortable: false,
      render: (a) => (
        <button
          onClick={() => toggleStatus(a)}
          disabled={busy}
          className={`rounded-lg px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
            a.status === 'active'
              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400'
              : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400'
          }`}
        >
          {a.status === 'active' ? '停用' : '启用'}
        </button>
      ),
    },
  ];

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      {showForm && (
        <div className="rounded-[20px] bg-white px-6 py-5 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
          <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">新建 App</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="ml-1.5 text-sm font-medium text-navy-700 dark:text-white">租户</label>
              <select
                className={selectCls}
                value={tenantId}
                onChange={(e) => {
                  setTenantId(e.target.value);
                  setWorkspaceId('');
                }}
              >
                <option value="">选择租户…</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="ml-1.5 text-sm font-medium text-navy-700 dark:text-white">Workspace</label>
              {tenantId && tenantWorkspaces.length === 0 ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    className="h-12 flex-1 rounded-xl border border-gray-200 bg-white/0 p-3 text-sm text-navy-700 outline-none dark:!border-white/10 dark:text-white"
                    placeholder="该租户暂无 workspace,输入名称新建"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                  />
                  <button
                    onClick={createWorkspace}
                    disabled={busy || !newWsName.trim()}
                    className="h-12 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white disabled:opacity-50 dark:bg-brand-400"
                  >
                    新建
                  </button>
                </div>
              ) : (
                <select
                  className={selectCls}
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  disabled={!tenantId}
                >
                  <option value="">选择 workspace…</option>
                  {tenantWorkspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <InputField
                id="app-name"
                label="App 名称"
                placeholder="例如:Acme Assistant"
                value={appName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppName(e.target.value)}
              />
            </div>

            <div>
              <label className="ml-1.5 text-sm font-medium text-navy-700 dark:text-white">Runtime</label>
              <select
                className={selectCls}
                value={runtimeType}
                onChange={(e) => setRuntimeType(e.target.value)}
              >
                {RUNTIMES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={createApp}
              disabled={busy || !tenantId || !workspaceId || !appName.trim()}
              className="linear rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50 dark:bg-brand-400"
            >
              创建 App
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <DataTable<App>
        title="Apps"
        columns={columns}
        data={apps}
        loading={loading}
        error={error}
        emptyText="还没有 app,点击右上角新建。"
        toolbar={
          !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="linear rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 dark:bg-brand-400"
            >
              + 新建 App
            </button>
          ) : null
        }
      />
    </div>
  );
}
