import { Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, formatINR } from '../../lib/format';
import CategoryIcon from './CategoryIcon';

export default function ExpenseRow({ expense }) {
  const details = [expense.title && expense.category, expense.bank ? `${expense.paymentMode} (${expense.bank})` : expense.paymentMode, formatDate(expense.date)];

  return (
    <Link
      to={`/expenses/${expense.id}`}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-sunken/60 sm:px-5"
    >
      <CategoryIcon category={expense.category} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{expense.title || expense.category}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{details.filter(Boolean).join(' · ')}</p>
      </div>
      {expense.proofUrl && <Paperclip role="img" aria-label="Proof attached" className="size-3.5 shrink-0 text-faint" />}
      <p className="shrink-0 text-sm font-medium text-fg tabular-nums">{formatINR(expense.amount)}</p>
    </Link>
  );
}
