'use client';
import { useCallback, useEffect, useState } from 'react';
import InputField from 'components/fields/InputField';
import DataTable, { SimpleColumn } from 'components/console/DataTable';
import StatusBadge from 'components/console/StatusBadge';

type Tenant = {
  id: string;
  name: string;
  status: 'active' | 'disabled';
  createdAt: string;
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tenants');
      if (!res.ok) throw new Error(`加载失败 (${res.status})`);
      setTenants(await res.json());
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createTenant = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      setName('');
      setShowForm(false);
      await load();
    } catch {
      setError('创建租户失败');
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (t: Tenant) => {
    const next = t.status === 'active' ? 'disabled' : 'active';
    setBusy(true);
    try {
      const res = await fetch(`/api/tenants/${t.id}/status`, {
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

  const columns: SimpleColumn<Tenant>[] = [
    {
      key: 'name',
      header: '租户名称',
      render: (t) => (
        <p className="text-sm font-bold text-navy-700 dark:text-white">{t.name}</p>
      ),
    },
    { key: 'status', header: '状态', render: (t) => <StatusBadge status={t.status} /> },
    {
      key: 'id',
      header: 'ID',
      render: (t) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{t.id}</span>
      ),
    },
    {
      key: 'createdAt',
      header: '创建时间',
      render: (t) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(t.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '操作',
      sortable: false,
      render: (t) => (
        <button
          onClick={() => toggleStatus(t)}
          disabled={busy}
          className={`rounded-lg px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
            t.status === 'active'
              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400'
              : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400'
          }`}
        >
          {t.status === 'active' ? '停用' : '启用'}
        </button>
      ),
    },
  ];

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      {showForm && (
        <div className="rounded-[20px] bg-white px-6 py-5 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <InputField
                id="tenant-name"
                label="租户名称"
                placeholder="例如:Acme Inc."
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
            </div>
            <button
              onClick={createTenant}
              disabled={busy || !name.trim()}
              className="linear h-12 rounded-xl bg-brand-500 px-6 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50 dark:bg-brand-400"
            >
              创建
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setName('');
              }}
              className="h-12 rounded-xl px-4 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <DataTable<Tenant>
        title="Tenants"
        columns={columns}
        data={tenants}
        loading={loading}
        error={error}
        emptyText="还没有租户,点击右上角新建。"
        toolbar={
          !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="linear rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 dark:bg-brand-400"
            >
              + 新建租户
            </button>
          ) : null
        }
      />
    </div>
  );
}
