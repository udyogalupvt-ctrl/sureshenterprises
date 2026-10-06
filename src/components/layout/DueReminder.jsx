import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellRing, Check, CircleCheck, X } from 'lucide-react';
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { DUE_ALERT_DAYS } from '../../lib/constants';
import { describeDue } from '../../lib/dueAlerts';
import { formatDate, formatINR } from '../../lib/format';
import { setPurchaseOrderCompleted } from '../../services/purchaseOrders';
import Button from '../ui/Button';

const GROUPS = [
  { key: 'overdue', title: 'Overdue', tone: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  { key: 'dueToday', title: 'Due today', tone: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  {
    key: 'dueSoon',
    title: `Due in the next ${DUE_ALERT_DAYS} days`,
    tone: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
];

async function markPaid(order) {
  try {
    await setPurchaseOrderCompleted(order.id, true);
    toast.success(
      (t) => (
        <span className="flex items-center gap-3">
          PO {order.poNumber} marked as paid
          <button
            type="button"
            className="font-semibold text-accent-ink hover:underline"
            onClick={() => {
              toast.dismiss(t.id);
              setPurchaseOrderCompleted(order.id, false).catch(() => toast.error('Couldn’t undo. Change the status on the order.'));
            }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: 6000 },
    );
  } catch (error) {
    console.error(error);
    toast.error('Couldn’t update the order. Please try again.');
  }
}

function ReminderRow({ order, tone, onNavigate }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <Link to={`/purchase-orders/${order.id}`} onClick={onNavigate} className="min-w-0 flex-1 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-accent/25">
        <p className="truncate text-sm font-medium text-fg">PO {order.poNumber}</p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {order.invoiceNumber} · Due {formatDate(order.dueDate)}
        </p>
      </Link>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-fg tabular-nums">{formatINR(order.poAmount)}</p>
        <p className={cn('mt-0.5 text-xs font-medium', tone)}>{describeDue(order.daysLeft)}</p>
      </div>
      <Button variant="secondary" size="sm" icon={Check} onClick={() => markPaid(order)} aria-label={`Mark PO ${order.poNumber} as paid`}>
        <span className="sm:hidden">Paid</span>
        <span className="max-sm:hidden">Mark paid</span>
      </Button>
    </li>
  );
}

/** Lists unpaid orders that are overdue, due today or due within DUE_ALERT_DAYS days. */
export function DueReminderDialog({ open, alerts, onClose }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[88dvh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-float sm:max-w-lg sm:rounded-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.35 }}
          >
            <div className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/12 text-amber-700 dark:text-amber-300">
                <BellRing className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-base font-semibold text-fg">
                  Payment reminders
                </h2>
                <p className="mt-0.5 text-[13px] text-muted">
                  Unpaid orders that are overdue or due in the next {DUE_ALERT_DAYS} days
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X />
              </Button>
            </div>

            <div className="overflow-y-auto px-5 sm:px-6">
              {alerts.count === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <CircleCheck className="size-8 text-accent-ink" />
                  <p className="mt-3 text-sm font-medium text-fg">All clear</p>
                  <p className="mt-1 text-[13px] text-muted">
                    No unpaid orders are due in the next {DUE_ALERT_DAYS} days.
                  </p>
                </div>
              ) : (
                GROUPS.filter(({ key }) => alerts[key].length).map(({ key, title, tone, dot }) => (
                  <section key={key} className="py-3">
                    <h3 className={cn('flex items-center gap-2 text-xs font-semibold tracking-wide uppercase', tone)}>
                      <span className={cn('size-2 rounded-full', dot)} />
                      {title}
                      <span className="font-medium text-faint">{alerts[key].length}</span>
                    </h3>
                    <ul className="divide-y divide-line">
                      {alerts[key].map((order) => (
                        <ReminderRow key={order.id} order={order} tone={tone} onNavigate={onClose} />
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-line px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
              <p className="flex-1 text-xs text-faint">Shows once a day. Tap the bell to see it again.</p>
              <Button onClick={onClose} autoFocus>
                Got it
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Bell that reopens the reminders, with a count of orders needing attention. */
export function DueBell({ count, onClick, className, label = false }) {
  const Icon = count ? BellRing : Bell;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count ? `Payment reminders, ${count} need attention` : 'Payment reminders'}
      title="Payment reminders"
      className={cn(
        'relative flex items-center gap-3 rounded-xl text-muted transition-colors hover:bg-sunken hover:text-fg focus-visible:ring-4 focus-visible:ring-accent/25 focus-visible:outline-none',
        className,
      )}
    >
      <span className="relative grid place-items-center">
        <Icon className="size-[18px]" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] leading-none font-semibold text-white tabular-nums">
            {count}
          </span>
        )}
      </span>
      {label && <span className="text-sm font-medium">Reminders</span>}
    </button>
  );
}
