import { ChartColumn } from 'lucide-react';
import { useMemo, useState } from 'react';
import KpiGrid from '../components/KpiGrid';
import BreakdownTable from '../components/reports/BreakdownTable';
import CategoryBreakdown from '../components/reports/CategoryBreakdown';
import ChartCard from '../components/reports/ChartCard';
import NetTrendChart from '../components/reports/NetTrendChart';
import ProfitChart from '../components/reports/ProfitChart';
import { Card, CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { Field, Input } from '../components/ui/Form';
import PageHeader from '../components/ui/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import { Skeleton } from '../components/ui/Skeleton';
import { useData } from '../context/DataContext';
import { formatINR, plural } from '../lib/format';
import { buildReport, currentMonthRange, formatRange, PERIODS } from '../lib/reports';

export default function Reports() {
  const { purchaseOrders, expenses, loading } = useData();
  const [period, setPeriod] = useState('this-month');
  const [custom, setCustom] = useState(currentMonthRange);

  const report = useMemo(
    () => buildReport({ purchaseOrders, expenses, period, custom }),
    [purchaseOrders, expenses, period, custom],
  );
  const hasActivity = report.orderCount + report.expenseCount > 0;
  const unit = report.granularity;

  return (
    <>
      <PageHeader eyebrow={formatRange(report.range)} title="Reports" />

      <div className="mb-6 space-y-4">
        <SegmentedControl
          label="Report period"
          options={PERIODS}
          value={period}
          onChange={setPeriod}
          className="sm:max-w-md"
        />
        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <Field label="From" htmlFor="range-start">
              <Input
                id="range-start"
                type="date"
                value={custom.start}
                max={custom.end}
                onChange={(event) => setCustom((range) => ({ ...range, start: event.target.value }))}
              />
            </Field>
            <Field label="To" htmlFor="range-end">
              <Input
                id="range-end"
                type="date"
                value={custom.end}
                min={custom.start}
                onChange={(event) => setCustom((range) => ({ ...range, end: event.target.value }))}
              />
            </Field>
          </div>
        )}
      </div>

      <KpiGrid
        totals={report.totals}
        orderCount={report.orderCount}
        expenseCount={report.expenseCount}
        loading={loading}
      />

      {loading ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:gap-6">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : !hasActivity ? (
        <Card className="mt-6">
          <EmptyState
            icon={ChartColumn}
            title="No activity in this period"
            description="Orders are counted by invoice date and expenses by their date. Try a different range."
          />
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:gap-6">
          <ChartCard
            className="lg:col-span-2"
            title={`Profit by ${unit}`}
            description="Profit from purchase orders, by invoice date"
          >
            <ProfitChart points={report.points} />
          </ChartCard>

          <ChartCard title="Net profit trend" description={`Running total of profit minus expenses, by ${unit}`}>
            <NetTrendChart points={report.points} />
          </ChartCard>

          <ChartCard
            title="Expenses by category"
            description={`${formatINR(report.totals.expenses)} across ${plural(report.expenseCount, 'expense')}`}
          >
            <CategoryBreakdown items={report.categories} />
          </ChartCard>

          <Card className="overflow-hidden lg:col-span-2">
            <CardHeader title="Breakdown" description={`Profit, expenses and net profit by ${unit}`} />
            <BreakdownTable points={report.points} totals={report.totals} />
          </Card>
        </div>
      )}
    </>
  );
}
