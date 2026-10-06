import { cn } from '../../lib/cn';

/** A spreadsheet-style table: green header row, gridlines, striped rows. Scrolls sideways on small screens. */
export function SheetTable({ minWidth = 960, className, children }) {
  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-line bg-surface shadow-soft', className)}>
      <table className="w-full border-collapse text-[13px] whitespace-nowrap" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function SheetHead({ columns }) {
  return (
    <thead>
      <tr className="bg-[#1F5F46] text-left text-xs font-semibold tracking-wide text-white uppercase">
        {columns.map((column) => (
          <th
            key={column.key}
            scope="col"
            className={cn(
              'border-r border-white/15 px-2.5 py-2.5 leading-tight whitespace-normal last:border-r-0',
              column.numeric && 'text-right',
              column.className,
            )}
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** Body row. Pass `onOpen` to make the row open its record. */
export function SheetRow({ onOpen, className, children }) {
  return (
    <tr
      onClick={onOpen}
      className={cn(
        'border-t border-line even:bg-sunken/40',
        onOpen && 'cursor-pointer transition-colors hover:bg-accent/[0.06]',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function SheetCell({ numeric = false, className, children }) {
  return (
    <td
      className={cn(
        'border-r border-line px-2.5 py-2.5 text-fg last:border-r-0',
        numeric && 'text-right tabular-nums',
        className,
      )}
    >
      {children}
    </td>
  );
}

export function SheetTotalRow({ children }) {
  return (
    <tfoot>
      <tr className="border-t-2 border-line-strong bg-sunken font-semibold">{children}</tr>
    </tfoot>
  );
}
