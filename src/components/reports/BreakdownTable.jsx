import { cn } from '../../lib/cn';
import { formatINR } from '../../lib/format';

const netClass = (value) => (value < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-fg');

/** The same numbers as the charts, as a table. Only periods with activity, newest first. */
export default function BreakdownTable({ points, totals }) {
  const rows = points.filter((point) => point.profit || point.expenses).reverse();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px] whitespace-nowrap sm:text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th scope="col" className="py-2.5 pr-3 pl-4 font-medium sm:pl-5">Period</th>
            <th scope="col" className="px-3 text-right font-medium">Profit</th>
            <th scope="col" className="px-3 text-right font-medium">Expenses</th>
            <th scope="col" className="pr-4 pl-3 text-right font-medium sm:pr-5">Net</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line tabular-nums">
          {rows.map((point) => (
            <tr key={point.key}>
              <td className="py-3 pr-3 pl-4 text-fg sm:pl-5">{point.label}</td>
              <td className="px-3 text-right text-muted">{formatINR(point.profit)}</td>
              <td className="px-3 text-right text-muted">{formatINR(point.expenses)}</td>
              <td className={cn('pr-4 pl-3 text-right font-medium sm:pr-5', netClass(point.net))}>
                {formatINR(point.net)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="tabular-nums">
          <tr className="border-t border-line-strong font-semibold">
            <td className="py-3 pr-3 pl-4 text-fg sm:pl-5">Total</td>
            <td className="px-3 text-right text-fg">{formatINR(totals.profit)}</td>
            <td className="px-3 text-right text-fg">{formatINR(totals.expenses)}</td>
            <td className={cn('pr-4 pl-3 text-right sm:pr-5', netClass(totals.net))}>{formatINR(totals.net)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
