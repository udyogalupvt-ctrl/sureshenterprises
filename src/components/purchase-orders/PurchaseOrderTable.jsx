import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { formatDate, formatINR } from '../../lib/format';
import { Card } from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';

/** Wide-screen table. Expects `order.status` to be precomputed. */
export default function PurchaseOrderTable({ orders }) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-line bg-sunken/50 text-left text-xs text-muted">
            <th scope="col" className="py-3 pr-3 pl-5 font-medium">PO / Invoice</th>
            <th scope="col" className="px-3 font-medium">Invoice date</th>
            <th scope="col" className="px-3 font-medium">Due date</th>
            <th scope="col" className="px-3 text-right font-medium">Amount</th>
            <th scope="col" className="px-3 text-right font-medium">GST</th>
            <th scope="col" className="px-3 text-right font-medium">Profit</th>
            <th scope="col" className="pr-5 pl-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => navigate(`/purchase-orders/${order.id}`)}
              className="cursor-pointer transition-colors hover:bg-sunken/60"
            >
              <td className="py-3.5 pr-3 pl-5">
                <Link to={`/purchase-orders/${order.id}`} className="font-medium text-fg">
                  PO {order.poNumber}
                </Link>
                <p className="mt-0.5 text-xs text-muted">{order.invoiceNumber}</p>
              </td>
              <td className="px-3 text-muted">{formatDate(order.invoiceDate)}</td>
              <td
                className={cn(
                  'px-3',
                  order.status === 'overdue' ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-muted',
                )}
              >
                {formatDate(order.dueDate)}
              </td>
              <td className="px-3 text-right text-fg tabular-nums">{formatINR(order.poAmount)}</td>
              <td className="px-3 text-right text-muted tabular-nums">{formatINR(order.gst)}</td>
              <td className="px-3 text-right font-medium text-accent-ink tabular-nums">{formatINR(order.profit)}</td>
              <td className="pr-5 pl-3">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
