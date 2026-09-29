import { motion } from 'framer-motion';
import { FileText, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '../lib/cn';
import { formatINR, plural } from '../lib/format';
import { Skeleton } from './ui/Skeleton';

function StatCard({ label, value, icon: Icon, caption, highlight = false }) {
  return (
    <div
      className={cn(
        'h-full rounded-2xl border p-4 sm:p-5',
        highlight ? 'border-accent/25 bg-accent/[0.07]' : 'border-line bg-surface shadow-soft',
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <p className="text-xs font-medium text-muted sm:text-[13px]">{label}</p>
        <span
          className={cn(
            'grid size-7 shrink-0 place-items-center rounded-lg sm:size-8',
            highlight ? 'bg-accent text-accent-fg' : 'bg-sunken text-muted',
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p
        className={cn(
          'mt-3 text-xl font-semibold tracking-tight sm:text-2xl',
          value < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-fg',
        )}
      >
        {formatINR(value)}
      </p>
      <p className="mt-1 truncate text-xs text-faint">{caption}</p>
    </div>
  );
}

/** The four headline numbers, shared by the dashboard and reports. */
export default function KpiGrid({ totals, orderCount, expenseCount, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[118px] rounded-2xl sm:h-[130px]" />
        ))}
      </div>
    );
  }

  const margin = totals.poAmount
    ? `${((totals.profit / totals.poAmount) * 100).toFixed(1)}% margin`
    : 'No orders yet';

  const cards = [
    { label: 'Total PO amount', value: totals.poAmount, icon: FileText, caption: plural(orderCount, 'order') },
    { label: 'Total profit', value: totals.profit, icon: TrendingUp, caption: margin },
    { label: 'Total expenses', value: totals.expenses, icon: Receipt, caption: plural(expenseCount, 'expense') },
    { label: 'Net profit', value: totals.net, icon: Wallet, caption: 'Profit − expenses', highlight: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <StatCard {...card} />
        </motion.div>
      ))}
    </div>
  );
}
