import { ArrowRight, FileText, Plus, Receipt } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ExpenseRow from '../components/expenses/ExpenseRow';
import KpiGrid from '../components/KpiGrid';
import PurchaseOrderRow from '../components/purchase-orders/PurchaseOrderRow';
import Button from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { SkeletonRows } from '../components/ui/Skeleton';
import { useData } from '../context/DataContext';
import { summarize } from '../lib/calculations';
import { formatLongDate } from '../lib/format';

const RECENT_COUNT = 5;

function greeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function RecentCard({ title, to, loading, empty, children }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={title}
        action={
          <Link
            to={to}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-ink hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        }
      />
      {loading ? <SkeletonRows rows={3} /> : children.length ? <div className="divide-y divide-line">{children}</div> : empty}
    </Card>
  );
}

export default function Dashboard() {
  const { purchaseOrders, expenses, loading } = useData();
  const totals = useMemo(() => summarize(purchaseOrders, expenses), [purchaseOrders, expenses]);
  const now = new Date();

  return (
    <>
      <PageHeader
        eyebrow={formatLongDate(now)}
        title={greeting(now.getHours())}
        actions={
          <div className="flex gap-2 max-lg:hidden">
            <Button variant="secondary" to="/expenses/new" icon={Receipt}>
              Add expense
            </Button>
            <Button to="/purchase-orders/new" icon={Plus}>
              New order
            </Button>
          </div>
        }
      />

      <KpiGrid
        totals={totals}
        orderCount={purchaseOrders.length}
        expenseCount={expenses.length}
        loading={loading}
      />

      <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-2 lg:gap-6">
        <RecentCard
          title="Recent purchase orders"
          to="/purchase-orders"
          loading={loading}
          empty={
            <EmptyState
              icon={FileText}
              title="No purchase orders yet"
              description="Add your first order to start tracking profit."
              action={
                <Button size="sm" to="/purchase-orders/new" icon={Plus}>
                  New order
                </Button>
              }
            />
          }
        >
          {purchaseOrders.slice(0, RECENT_COUNT).map((order) => (
            <PurchaseOrderRow key={order.id} order={order} />
          ))}
        </RecentCard>

        <RecentCard
          title="Recent expenses"
          to="/expenses"
          loading={loading}
          empty={
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Record what you spend to see your real net profit."
              action={
                <Button size="sm" to="/expenses/new" icon={Plus}>
                  Add expense
                </Button>
              }
            />
          }
        >
          {expenses.slice(0, RECENT_COUNT).map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))}
        </RecentCard>
      </div>
    </>
  );
}
