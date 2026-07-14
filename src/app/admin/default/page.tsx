'use client';
import MiniStatistics from 'components/card/MiniStatistics';
import Card from 'components/card';
import { useApi } from 'lib/useApi';
import {
  MdLink,
  MdInbox,
  MdOutlineSend,
  MdPayments,
  MdMonitorHeart,
  MdWarning,
} from 'react-icons/md';

type DashboardCard = { id: string; label: string; value: number; status: string };
type Dashboard = {
  cards: DashboardCard[];
  webhook: { success: number; failed: number; abandoned: number; averageDurationMs?: number };
  channelHealth: { healthy: number; degraded: number; down: number };
  billing: { totalQuantity: number };
  alerts: { id: string; severity: 'critical' | 'warn'; message: string }[];
  messageVolumeByApp: { appId: string; count: number }[];
};

const ICONS: Record<string, JSX.Element> = {
  'active-bindings': <MdLink className="h-7 w-7" />,
  'events-total': <MdInbox className="h-7 w-7" />,
  'webhook-failures': <MdOutlineSend className="h-7 w-7" />,
  'usage-total': <MdPayments className="h-7 w-7" />,
  'channel-issues': <MdMonitorHeart className="h-7 w-7" />,
};

export default function OverviewPage() {
  const { data, loading, error } = useApi<Dashboard | null>('/api/platform/dashboard', null);

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      {/* KPI row from /v1/admin/dashboard */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        {(data?.cards ?? []).map((c) => (
          <MiniStatistics
            key={c.id}
            name={c.label}
            value={loading ? '…' : String(c.value)}
            iconBg="bg-lightPrimary dark:bg-navy-700"
            icon={ICONS[c.id] ?? <MdInbox className="h-7 w-7" />}
          />
        ))}
        {!data &&
          !loading &&
          [0, 1, 2, 3, 4].map((i) => (
            <MiniStatistics
              key={i}
              name="—"
              value="—"
              iconBg="bg-lightPrimary dark:bg-navy-700"
              icon={<MdInbox className="h-7 w-7" />}
            />
          ))}
      </div>

      {error && (
        <Card extra="w-full px-6 py-4">
          <p className="text-sm font-medium text-red-500 dark:text-red-400">
            无法加载概览数据:{error}(请确认平台服务已启动)
          </p>
        </Card>
      )}

      {/* Alerts */}
      {data?.alerts && data.alerts.length > 0 && (
        <Card extra="w-full px-6 py-5">
          <h4 className="mb-3 text-lg font-bold text-navy-700 dark:text-white">告警</h4>
          <div className="flex flex-col gap-2">
            {data.alerts.map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
                  a.severity === 'critical'
                    ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                }`}
              >
                <MdWarning className="h-5 w-5" />
                {a.message}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Webhook + channel health summary */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card extra="w-full px-6 py-5">
          <h4 className="mb-3 text-lg font-bold text-navy-700 dark:text-white">Webhook 投递</h4>
          <div className="flex gap-6">
            <Stat label="成功" value={data?.webhook.success ?? 0} tone="ok" />
            <Stat label="失败" value={data?.webhook.failed ?? 0} tone="warn" />
            <Stat label="放弃" value={data?.webhook.abandoned ?? 0} tone="bad" />
          </div>
        </Card>
        <Card extra="w-full px-6 py-5">
          <h4 className="mb-3 text-lg font-bold text-navy-700 dark:text-white">渠道健康</h4>
          <div className="flex gap-6">
            <Stat label="健康" value={data?.channelHealth.healthy ?? 0} tone="ok" />
            <Stat label="降级" value={data?.channelHealth.degraded ?? 0} tone="warn" />
            <Stat label="宕机" value={data?.channelHealth.down ?? 0} tone="bad" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'ok' | 'warn' | 'bad' }) {
  const color =
    tone === 'ok'
      ? 'text-green-500'
      : tone === 'warn'
      ? 'text-amber-500'
      : 'text-red-500';
  return (
    <div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
      <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
    </div>
  );
}
