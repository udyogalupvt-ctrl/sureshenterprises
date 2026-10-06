import { BadgeIndianRupee, ChartColumn, FileSpreadsheet, FileText, Receipt, ReceiptText, Sheet } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { exportToExcel } from '../../lib/excelExport';
import { plural } from '../../lib/format';
import Button from '../ui/Button';
import Menu from '../ui/Menu';

function ExportItem({ icon: Icon, title, description, disabled, onSelect }) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-fg outline-none transition-colors hover:bg-sunken focus-visible:bg-sunken disabled:pointer-events-none disabled:opacity-45"
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-muted" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-muted">{description}</span>
      </span>
    </button>
  );
}

/** Downloads the selected period as Excel: everything in one file, or one section per file. */
export default function ExportMenu({ data, report, allTime, periodLabel, disabled }) {
  const [busy, setBusy] = useState(false);
  const counts = {
    orders: data.orders.length,
    expenses: data.expenses.length,
    gstOthers: data.gstOthers.length,
    ownGst: data.ownGst.length,
  };
  const isEmpty = Object.values(counts).every((count) => count === 0);

  const run = async (sections, close) => {
    close(false);
    setBusy(true);
    try {
      await exportToExcel({ sections, data, report, allTime });
      toast.success('Excel file downloaded');
    } catch (error) {
      console.error(error);
      toast.error('Couldn’t create the Excel file. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Menu
      label="Export to Excel"
      width={290}
      trigger={(props) => (
        <Button variant="secondary" icon={FileSpreadsheet} loading={busy} disabled={disabled} {...props}>
          <span className="sm:hidden">Export</span>
          <span className="max-sm:hidden">Export to Excel</span>
        </Button>
      )}
    >
      {({ close }) => (
        <>
          <p className="px-2.5 pt-1.5 pb-2 text-xs text-muted">
            Period: <span className="font-medium text-fg">{periodLabel}</span>
          </p>
          <ExportItem
            icon={Sheet}
            title="Everything in one file"
            description="Summary, purchase orders, expenses, GST others and own GST as 5 sheets"
            disabled={isEmpty}
            onSelect={() => run(['summary', 'orders', 'expenses', 'gstOthers', 'ownGst'], close)}
          />
          <div className="my-1 border-t border-line" />
          <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-faint uppercase">
            Separate files
          </p>
          <ExportItem
            icon={ChartColumn}
            title="Summary"
            description="Totals, net profit and the breakdown"
            disabled={isEmpty}
            onSelect={() => run(['summary'], close)}
          />
          <ExportItem
            icon={FileText}
            title="Purchase orders"
            description={plural(counts.orders, 'order')}
            disabled={!counts.orders}
            onSelect={() => run(['orders'], close)}
          />
          <ExportItem
            icon={Receipt}
            title="Expenses"
            description={plural(counts.expenses, 'expense')}
            disabled={!counts.expenses}
            onSelect={() => run(['expenses'], close)}
          />
          <ExportItem
            icon={ReceiptText}
            title="GST others"
            description={`${plural(counts.gstOthers, 'entry')}, matched by month`}
            disabled={!counts.gstOthers}
            onSelect={() => run(['gstOthers'], close)}
          />
          <ExportItem
            icon={BadgeIndianRupee}
            title="Own GST"
            description={`${plural(counts.ownGst, 'entry')}, matched by month`}
            disabled={!counts.ownGst}
            onSelect={() => run(['ownGst'], close)}
          />
        </>
      )}
    </Menu>
  );
}
