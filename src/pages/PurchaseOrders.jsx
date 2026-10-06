import { FileText, Plus, SearchX } from 'lucide-react';
import { useMemo } from 'react';
import PurchaseOrderCard from '../components/purchase-orders/PurchaseOrderCard';
import PurchaseOrderTable from '../components/purchase-orders/PurchaseOrderTable';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { SearchInput } from '../components/ui/Form';
import PageHeader from '../components/ui/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import { ListSkeleton } from '../components/ui/Skeleton';
import { useData } from '../context/DataContext';
import { useSearchParam } from '../hooks/useSearchParam';
import { getPOStatus } from '../lib/calculations';
import { formatINR, plural, toISODate } from '../lib/format';

const FILTERS = {
  all: () => true,
  pending: (status) => status === 'pending' || status === 'dueToday',
  overdue: (status) => status === 'overdue',
};

export default function PurchaseOrders() {
  const { purchaseOrders, loading } = useData();
  const [search, setSearch] = useSearchParam('q');
  const [filter, setFilter] = useSearchParam('status', 'all');

  // Newest invoice first; same-day invoices by invoice number, so the list reads like the sheet.
  const orders = useMemo(() => {
    const today = toISODate();
    return purchaseOrders
      .map((order) => ({ ...order, status: getPOStatus(order, today) }))
      .sort(
        (a, b) =>
          (b.invoiceDate ?? '').localeCompare(a.invoiceDate ?? '') ||
          String(b.invoiceNumber ?? '').localeCompare(String(a.invoiceNumber ?? ''), undefined, { numeric: true }),
      );
  }, [purchaseOrders]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matchesFilter = FILTERS[filter] ?? FILTERS.all;
    return orders.filter(
      (order) =>
        matchesFilter(order.status) &&
        (!query ||
          order.poNumber?.toLowerCase().includes(query) ||
          order.invoiceNumber?.toLowerCase().includes(query)),
    );
  }, [orders, search, filter]);

  const filterOptions = [
    { value: 'all', label: 'All', count: orders.length },
    { value: 'pending', label: 'Pending', count: orders.filter((o) => FILTERS.pending(o.status)).length },
    { value: 'overdue', label: 'Overdue', count: orders.filter((o) => FILTERS.overdue(o.status)).length },
  ];

  const isFiltered = Boolean(search) || filter !== 'all';
  const sum = (key) => visible.reduce((total, order) => total + (Number(order[key]) || 0), 0);
  const totalAmount = sum('poAmount');
  const totalGST = sum('gst');
  const totalProfit = sum('profit');

  return (
    <>
      <PageHeader
        eyebrow={loading ? undefined : plural(orders.length, 'order')}
        title="Purchase orders"
        actions={
          <Button to="/purchase-orders/new" icon={Plus} className="max-lg:hidden">
            New order
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search PO or invoice number"
          className="sm:max-w-xs sm:flex-1"
        />
        <SegmentedControl
          label="Filter by status"
          options={filterOptions}
          value={filter}
          onChange={setFilter}
          className="sm:ml-auto"
        />
      </div>

      {!loading && orders.length > 0 && (
        <div className="mt-4 mb-3 flex items-center justify-between gap-4 text-[13px] text-muted">
          <p>
            <span className="whitespace-nowrap">
              {plural(visible.length, 'order')} · <span className="font-medium text-fg">{formatINR(totalAmount)}</span>
            </span>{' '}
            · <span className="whitespace-nowrap">GST {formatINR(totalGST)}</span>{' '}
            ·{' '}
            <span className="whitespace-nowrap">
              Net profit <span className="font-medium text-accent-ink">{formatINR(totalProfit)}</span>
            </span>
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
              className="font-medium text-accent-ink hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="mt-4">
          <ListSkeleton />
        </div>
      ) : orders.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            icon={FileText}
            title="No purchase orders yet"
            description="Add an order and its GST, profit and due date are worked out for you."
            action={
              <Button to="/purchase-orders/new" icon={Plus}>
                New order
              </Button>
            }
          />
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState icon={SearchX} title="No matching orders" description="Try a different search or filter." />
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:hidden">
            {visible.map((order) => (
              <PurchaseOrderCard key={order.id} order={order} />
            ))}
          </div>
          <div className="hidden xl:block">
            <PurchaseOrderTable orders={visible} />
          </div>
        </>
      )}
    </>
  );
}
