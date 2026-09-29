import { motion } from 'framer-motion';
import { formatINR } from '../../lib/format';
import CategoryIcon from '../expenses/CategoryIcon';

const formatShare = (share) => (share > 0 && share < 0.01 ? '<1%' : `${Math.round(share * 100)}%`);

/** Ranked bars — easier to compare than a many-slice donut. */
export default function CategoryBreakdown({ items }) {
  if (!items.length) {
    return <p className="py-12 text-center text-sm text-muted">No expenses in this period.</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map(({ category, amount, share }) => (
        <li key={category}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5">
              <CategoryIcon category={category} size="sm" />
              <span className="truncate text-fg">{category}</span>
            </span>
            <span className="shrink-0 tabular-nums">
              <span className="font-medium text-fg">{formatINR(amount)}</span>
              <span className="ml-2 inline-block w-9 text-right text-xs text-faint">{formatShare(share)}</span>
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken">
            <motion.div
              className="h-full rounded-full bg-chart"
              initial={{ width: 0 }}
              animate={{ width: `${share * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
