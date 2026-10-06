import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { GST_RATE } from '../../lib/constants';
import { formatDate, formatINR, formatPayment } from '../../lib/format';
import { SheetCell, SheetHead, SheetRow, SheetTable, SheetTotalRow } from '../ui/SheetTable';
import StatusMenu from './StatusMenu';

const COLUMNS = [
  { key: 'month', header: 'Month' },
  { key: 'po', header: 'PO no' },
  { key: 'inv', header: 'Inv no' },
  { key: 'invDate', header: 'Inv date' },
  { key: 'dueDate', header: 'Due date' },
  { key: 'amount', header: 'PO amount', numeric: true },
  { key: 'payment', header: 'Payment req', numeric: true },
  { key: 'gst', header: `GST (${GST_RATE * 100}%)`, numeric: true },
  { key: 'profit', header: 'Net profit', numeric: true },
  { key: 'status', header: 'Status' },
];

const total = (orders, key) => orders.reduce((sum, order) => sum + (Number(order[key]) || 0), 0);
const profitColor = (value) => (value < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-accent-ink');

/** Wide-screen table laid out like the purchase-order sheet. Expects `order.status` to be precomputed. */
export default function PurchaseOrderTable({ orders }) {
  const navigate = useNavigate();
  const profit = total(orders, 'profit');

  return (
    <SheetTable minWidth={1040}>
      <SheetHead columns={COLUMNS} />
      <tbody>
        {orders.map((order) => (
          <SheetRow key={order.id} onOpen={() => navigate(`/purchase-orders/${order.id}`)}>
            <SheetCell className="font-medium text-muted">{order.month}</SheetCell>
            <SheetCell>
              <Link
                to={`/purchase-orders/${order.id}`}
                onClick={(event) => event.stopPropagation()}
                className="font-medium text-fg hover:underline"
              >
                {order.poNumber}
              </Link>
            </SheetCell>
            <SheetCell className="text-muted">{order.invoiceNumber}</SheetCell>
            <SheetCell className="text-muted">{formatDate(order.invoiceDate)}</SheetCell>
            <SheetCell
              className={order.status === 'overdue' ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-muted'}
            >
              {formatDate(order.dueDate)}
            </SheetCell>
            <SheetCell numeric>{formatINR(order.poAmount)}</SheetCell>
            <SheetCell
              numeric
              className={order.paymentRequired == null ? 'font-semibold text-amber-700 dark:text-amber-400' : undefined}
            >
              {formatPayment(order.paymentRequired)}
            </SheetCell>
            <SheetCell numeric className="text-muted">
              {formatINR(order.gst)}
            </SheetCell>
            <SheetCell numeric className={cn('font-semibold', profitColor(order.profit))}>
              {formatINR(order.profit)}
            </SheetCell>
            <SheetCell className="py-1.5">
              <StatusMenu order={order} />
            </SheetCell>
          </SheetRow>
        ))}
      </tbody>
      <SheetTotalRow>
        <SheetCell>Total</SheetCell>
        <SheetCell />
        <SheetCell />
        <SheetCell />
        <SheetCell />
        <SheetCell numeric>{formatINR(total(orders, 'poAmount'))}</SheetCell>
        <SheetCell numeric>{formatINR(total(orders, 'paymentRequired'))}</SheetCell>
        <SheetCell numeric>{formatINR(total(orders, 'gst'))}</SheetCell>
        <SheetCell numeric className={profitColor(profit)}>
          {formatINR(profit)}
        </SheetCell>
        <SheetCell />
      </SheetTotalRow>
    </SheetTable>
  );
}
