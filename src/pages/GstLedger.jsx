import { Plus, ReceiptText, SearchX } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import GstEntryDialog from '../components/gst-others/GstEntryDialog';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { SearchInput } from '../components/ui/Form';
import PageHeader from '../components/ui/PageHeader';
import { SheetCell, SheetHead, SheetRow, SheetTable, SheetTotalRow } from '../components/ui/SheetTable';
import { ListSkeleton } from '../components/ui/Skeleton';
import { useData } from '../context/DataContext';
import { useSearchParam } from '../hooks/useSearchParam';
import { cn } from '../lib/cn';
import { formatAmount, formatDate, plural } from '../lib/format';
import { deleteGstEntry, GST_LEDGERS } from '../services/gstLedger';

// Same columns, in the same order, as the Tax Invoice Tracking sheet.
const COLUMNS = [
  { key: 'month', header: 'Month' },
  { key: 'company', header: 'Company name' },
  { key: 'gstNo', header: 'GST no' },
  { key: 'inv', header: 'Inv no', numeric: true },
  { key: 'tax', header: 'Tax amount', numeric: true },
  { key: 'rate', header: 'GST', numeric: true },
  { key: 'share', header: 'Share', numeric: true },
  { key: 'shareValue', header: 'Share value', numeric: true },
  { key: 'balance', header: 'Balance', numeric: true },
  { key: 'balanceAmount', header: 'Balance amount', numeric: true },
  { key: 'status', header: 'Status' },
  { key: 'date', header: 'Date' },
];

const percent = (value) => `${(Number(value) || 0).toFixed(2)}%`;
const total = (entries, key) => entries.reduce((sum, entry) => sum + (Number(entry[key]) || 0), 0);

/** A GST sheet (`ledger`: 'others' | 'own'), shown as a spreadsheet. Rows open in a dialog to edit. */
export default function GstLedger({ ledger }) {
  const { title } = GST_LEDGERS[ledger];
  const data = useData();
  const entries = ledger === 'own' ? data.ownGst : data.gstOthers;
  const { loading } = data;

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  // ?new=1 opens a blank entry, so the mobile + Add button can link straight to it.
  const [newParam, setNewParam] = useSearchParam('new');
  const [pendingDelete, setPendingDelete] = useState(null);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter(
      (entry) =>
        entry.companyName?.toLowerCase().includes(query) ||
        entry.gstNo?.toLowerCase().includes(query) ||
        String(entry.invoiceNumber ?? '').toLowerCase().includes(query),
    );
  }, [entries, search]);

  const openNew = () => setNewParam('1');
  const closeDialog = useCallback(() => {
    setEditing(null);
    setNewParam('');
  }, [setNewParam]);

  const confirmDelete = async () => {
    try {
      await deleteGstEntry(ledger, pendingDelete.id);
      toast.success('Entry deleted');
      setPendingDelete(null);
      closeDialog();
    } catch (error) {
      console.error(error);
      toast.error('Couldn’t delete the entry. Please try again.');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={loading ? undefined : plural(entries.length, 'entry')}
        title={title}
        actions={
          <Button icon={Plus} onClick={openNew} className="max-lg:hidden">
            Add entry
          </Button>
        }
      />

      {!loading && entries.length > 0 && (
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search company, GSTIN or invoice"
          className="mb-4 sm:max-w-md"
        />
      )}

      {loading ? (
        <ListSkeleton />
      ) : entries.length === 0 ? (
        <Card>
          <EmptyState
            icon={ReceiptText}
            title="No entries yet"
            description="Add a tax invoice to track its tax, share and balance amounts."
            action={
              <Button icon={Plus} onClick={openNew}>
                Add entry
              </Button>
            }
          />
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState icon={SearchX} title="No matching entries" description="Try a different search." />
        </Card>
      ) : (
        <>
          <p className="mb-2 text-[13px] text-muted xl:hidden">Scroll sideways to see every column.</p>
          <SheetTable minWidth={980}>
            <SheetHead columns={COLUMNS} />
            <tbody>
              {visible.map((entry) => (
                <SheetRow key={entry.id} onOpen={() => setEditing(entry)}>
                  <SheetCell className="text-muted">{entry.month}</SheetCell>
                  <SheetCell className="max-w-56 min-w-44 whitespace-normal">
                    {/* The row is clickable; this button gives keyboard and screen-reader users the same action. */}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditing(entry);
                      }}
                      className="rounded text-left font-medium text-fg hover:underline focus-visible:ring-4 focus-visible:ring-accent/25 focus-visible:outline-none"
                    >
                      {entry.companyName}
                    </button>
                  </SheetCell>
                  <SheetCell className="font-mono text-[12px] text-muted">{entry.gstNo}</SheetCell>
                  <SheetCell numeric>{entry.invoiceNumber}</SheetCell>
                  <SheetCell numeric>{formatAmount(entry.taxAmount)}</SheetCell>
                  <SheetCell numeric className="text-muted">
                    {`${entry.gstRate ?? 18}%`}
                  </SheetCell>
                  <SheetCell numeric className="text-muted">
                    {percent(entry.sharePercent)}
                  </SheetCell>
                  <SheetCell numeric>{formatAmount(entry.shareValue)}</SheetCell>
                  <SheetCell numeric className="text-muted">
                    {percent(entry.balancePercent)}
                  </SheetCell>
                  <SheetCell numeric className="font-semibold text-accent-ink">
                    {formatAmount(entry.balanceAmount)}
                  </SheetCell>
                  <SheetCell>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide',
                        entry.status === 'paid'
                          ? 'bg-accent/15 text-accent-ink'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
                      )}
                    >
                      {entry.status === 'paid' ? 'PAID' : 'UNPAID'}
                    </span>
                  </SheetCell>
                  <SheetCell className={entry.date ? 'text-muted' : 'text-faint'}>
                    {entry.date ? formatDate(entry.date) : 'Add date'}
                  </SheetCell>
                </SheetRow>
              ))}
            </tbody>
            <SheetTotalRow>
              <SheetCell>Total</SheetCell>
              <SheetCell className="font-normal text-muted">{plural(visible.length, 'entry')}</SheetCell>
              <SheetCell />
              <SheetCell />
              <SheetCell numeric>{formatAmount(total(visible, 'taxAmount'))}</SheetCell>
              <SheetCell />
              <SheetCell />
              <SheetCell numeric>{formatAmount(total(visible, 'shareValue'))}</SheetCell>
              <SheetCell />
              <SheetCell numeric className="text-accent-ink">
                {formatAmount(total(visible, 'balanceAmount'))}
              </SheetCell>
              <SheetCell />
              <SheetCell />
            </SheetTotalRow>
          </SheetTable>
        </>
      )}

      <GstEntryDialog
        ledger={ledger}
        open={Boolean(editing) || newParam === '1'}
        entry={editing}
        onClose={closeDialog}
        onDelete={(entry) => setPendingDelete(entry)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this entry?"
        description={pendingDelete ? `${pendingDelete.companyName} · INV ${pendingDelete.invoiceNumber}` : ''}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
