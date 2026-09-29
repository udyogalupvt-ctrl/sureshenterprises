import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPOStatus } from '../../lib/calculations';
import { formatDate, formatINR } from '../../lib/format';
import StatusBadge from '../ui/StatusBadge';

/** Compact row used in the dashboard's recent list. */
export default function PurchaseOrderRow({ order }) {
  return (
    <Link
      to={`/purchase-orders/${order.id}`}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-sunken/60 sm:px-5"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sunken text-muted">
        <FileText className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">PO {order.poNumber}</p>
        <p className="mt-0.5 truncate text-xs text-muted">Due {formatDate(order.dueDate)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <p className="text-sm font-medium text-fg tabular-nums">{formatINR(order.poAmount)}</p>
        <StatusBadge status={getPOStatus(order)} />
      </div>
    </Link>
  );
}
