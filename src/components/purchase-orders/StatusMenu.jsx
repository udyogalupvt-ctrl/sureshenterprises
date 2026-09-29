import { ChevronDown, CircleCheck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPOStatus } from '../../lib/calculations';
import { setPurchaseOrderCompleted } from '../../services/purchaseOrders';
import Menu, { MenuItem } from '../ui/Menu';
import StatusBadge from '../ui/StatusBadge';

/** The order's status badge, which opens a menu to mark it completed or awaiting payment in place. */
export default function StatusMenu({ order }) {
  const completed = Boolean(order.completed);

  const update = async (nextCompleted) => {
    if (nextCompleted === completed) return;
    try {
      await setPurchaseOrderCompleted(order.id, nextCompleted);
      toast.success(`PO ${order.poNumber} ${nextCompleted ? 'marked as completed' : 'is awaiting payment again'}`);
    } catch (error) {
      console.error(error);
      toast.error('Couldn’t update the status. Please try again.');
    }
  };

  return (
    <Menu
      label={`Status of PO ${order.poNumber}`}
      width={264}
      trigger={(props) => (
        <button
          type="button"
          title="Change status"
          className="relative z-10 shrink-0 rounded-full outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
          {...props}
        >
          <StatusBadge status={order.status ?? getPOStatus(order)}>
            <ChevronDown className="-mr-0.5 size-3 opacity-60" />
          </StatusBadge>
        </button>
      )}
    >
      {({ close }) => (
        <>
          <MenuItem
            icon={Clock}
            checked={!completed}
            description="Shown as Pending, Due today or Overdue from the due date"
            onSelect={() => {
              close();
              update(false);
            }}
          >
            Awaiting payment
          </MenuItem>
          <MenuItem
            icon={CircleCheck}
            checked={completed}
            description="Payment for this order has been received"
            onSelect={() => {
              close();
              update(true);
            }}
          >
            Completed
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
