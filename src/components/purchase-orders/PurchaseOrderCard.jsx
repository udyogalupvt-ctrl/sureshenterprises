import { ArrowRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { formatDate, formatINR } from '../../lib/format';
import StatusMenu from './StatusMenu';

function Metric({ label, value, accent = false }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-faint">{label}</dt>
      <dd className={cn('mt-0.5 text-sm font-semibold tabular-nums', accent ? 'text-accent-ink' : 'text-fg')}>
        {formatINR(value)}
      </dd>
    </div>
  );
}

/**
 * Stacked card for small screens. Expects `order.status` to be precomputed.
 * The PO link stretches over the whole card so the status menu can sit on top of it.
 */
export default function PurchaseOrderCard({ order }) {
  return (
    <article className="relative rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-fg">
            <Link
              to={`/purchase-orders/${order.id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-4 focus-visible:after:ring-accent/25"
            >
              PO {order.poNumber}
            </Link>
          </p>
          <p className="mt-0.5 truncate text-[13px] text-muted">Invoice {order.invoiceNumber}</p>
        </div>
        <StatusMenu order={order} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted">
        <CalendarDays className="size-3.5 text-faint" />
        {formatDate(order.invoiceDate)}
        <ArrowRight className="size-3 text-faint" />
        <span className={cn(order.status === 'overdue' && 'font-medium text-rose-600 dark:text-rose-400')}>
          Due {formatDate(order.dueDate)}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3">
        <Metric label="Amount" value={order.poAmount} />
        <Metric label="GST" value={order.gst} />
        <Metric label="Profit" value={order.profit} accent />
      </dl>
    </article>
  );
}
