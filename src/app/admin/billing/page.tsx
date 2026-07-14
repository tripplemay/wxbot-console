'use client';
import MiniStatistics from 'components/card/MiniStatistics';
import Card from 'components/card';
import BarChart from 'components/charts/BarChart';
import DataTable, { SimpleColumn } from 'components/console/DataTable';
import { useApi } from 'lib/useApi';
import { MdPayments } from 'react-icons/md';

type Billing = {
  totalQuantity: number;
  byKind: Record<string, number>;
  byApp: Record<string, number>;
};

const barChartOptions = (categories: string[]) => ({
  chart: { toolbar: { show: false } },
  colors: ['#4318FF'],
  dataLabels: { enabled: false },
  grid: { show: false, strokeDashArray: 5 },
  legend: { show: false },
  plotOptions: { bar: { borderRadius: 8, columnWidth: '32px' } },
  tooltip: { theme: 'dark' },
  xaxis: {
    categories,
    labels: { style: { colors: '#A3AED0', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { style: { colors: '#A3AED0', fontSize: '12px' } } },
});

export default function BillingPage() {
  const { data, loading, error } = useApi<Billing | null>('/api/platform/billing-summary', null);

  const kinds = data ? Object.keys(data.byKind) : [];
  const chartData = [{ name: '数量', data: kinds.map((k) => data!.byKind[k]) }];
  const byAppRows = data
    ? Object.entries(data.byApp).map(([appId, quantity]) => ({ appId, quantity }))
    : [];

  const columns: SimpleColumn<{ appId: string; quantity: number }>[] = [
    { key: 'appId', header: 'App', render: (r) => <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{r.appId}</span> },
    { key: 'quantity', header: '计量用量', render: (r) => <span className="text-sm font-bold text-navy-700 dark:text-white">{r.quantity}</span> },
  ];

  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MiniStatistics
          name="总计量用量"
          value={loading ? '…' : String(data?.totalQuantity ?? 0)}
          iconBg="bg-lightPrimary dark:bg-navy-700"
          icon={<MdPayments className="h-7 w-7" />}
        />
      </div>

      {error && (
        <Card extra="w-full px-6 py-4">
          <p className="text-sm font-medium text-red-500 dark:text-red-400">
            无法加载计费数据:{error}
          </p>
        </Card>
      )}

      <Card extra="w-full px-6 py-5">
        <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">按类型用量</h4>
        {!loading && data && kinds.length > 0 ? (
          <div className="h-[300px] w-full">
            <BarChart key={kinds.join(',')} chartData={chartData} chartOptions={barChartOptions(kinds)} />
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? '加载中…' : '暂无用量数据。'}
          </p>
        )}
      </Card>

      <DataTable<{ appId: string; quantity: number }>
        title="按 App 用量"
        columns={columns}
        data={byAppRows}
        loading={loading}
        emptyText="暂无按 App 的用量记录。"
      />
    </div>
  );
}
