import { CalendarClock, CircleAlert, CircleCheck, Clock } from 'lucide-react';
import { cn } from '../../lib/cn';

const STATUSES = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-sky-500/10 text-sky-700 ring-sky-600/20 dark:text-sky-300 dark:ring-sky-400/20',
  },
  dueToday: {
    label: 'Due today',
    icon: CalendarClock,
    className: 'bg-amber-500/10 text-amber-700 ring-amber-600/25 dark:text-amber-300 dark:ring-amber-400/20',
  },
  overdue: {
    label: 'Overdue',
    icon: CircleAlert,
    className: 'bg-rose-500/10 text-rose-700 ring-rose-600/20 dark:text-rose-300 dark:ring-rose-400/20',
  },
  completed: {
    label: 'Completed',
    icon: CircleCheck,
    className: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-300 dark:ring-emerald-400/20',
  },
};

export default function StatusBadge({ status, className }) {
  const { label, icon: Icon, className: tone } = STATUSES[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
