import { Check, Trash2, X } from 'lucide-react';
import { useEffect, useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GST_RATE } from '../../lib/constants';
import { calcGSTOthers } from '../../lib/calculations';
import { formatINR, MONTH_CODE_OPTIONS, monthCode, toISODate } from '../../lib/format';
import { createGstEntry, updateGstEntry, GST_LEDGERS } from '../../services/gstLedger';
import Button from '../ui/Button';
import { CurrencyInput, Field, FormSection, Input, Select } from '../ui/Form';

const GST_RATES = [5, 12, 18, 28];

/** Share % + balance % always add up to the GST rate, so the balance can follow the share. */
const balanceFor = (rate, share) => {
  const balance = Math.round(((Number(rate) || 0) - (Number(share) || 0)) * 100) / 100;
  return balance >= 0 ? String(balance) : '';
};

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
];

function defaultValues(entry) {
  if (!entry) {
    const today = toISODate();
    return {
      companyName: '',
      gstNo: '',
      invoiceNumber: '',
      month: monthCode(today),
      taxAmount: '',
      gstRate: String(GST_RATE * 100),
      sharePercent: '',
      balancePercent: '',
      status: 'unpaid',
      date: today,
    };
  }
  return {
    companyName: entry.companyName ?? '',
    gstNo: entry.gstNo ?? '',
    invoiceNumber: entry.invoiceNumber ?? '',
    month: entry.month ?? '',
    taxAmount: String(entry.taxAmount ?? ''),
    gstRate: String(entry.gstRate ?? GST_RATE * 100),
    sharePercent: String(entry.sharePercent ?? ''),
    balancePercent: String(entry.balancePercent ?? ''),
    status: entry.status ?? 'unpaid',
    date: entry.date ?? '',
  };
}

const requiredText = (message) => ({ validate: (value) => value.trim() !== '' || message });

function PreviewRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={strong ? 'font-semibold text-fg tabular-nums' : 'font-medium text-fg tabular-nums'}>{value}</dd>
    </div>
  );
}

/** Add or edit one entry of a GST sheet (`ledger`: 'others' | 'own'). Pass `entry` to edit; `onDelete` shows delete. */
export default function GstEntryDialog({ ledger, open, entry, onClose, onDelete }) {
  const titleId = useId();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultValues(entry) });

  const [taxAmount, gstRate, sharePercent, balancePercent] = useWatch({
    control,
    name: ['taxAmount', 'gstRate', 'sharePercent', 'balancePercent'],
  });
  const split = calcGSTOthers(taxAmount, sharePercent, balancePercent, gstRate);
  const followBalance = () =>
    setValue('balancePercent', balanceFor(getValues('gstRate'), getValues('sharePercent')));

  // Reset the form each time the dialog opens, so a previous edit never leaks into the next one.
  useEffect(() => {
    if (open) reset(defaultValues(entry));
  }, [open, entry, reset]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (values) => {
    try {
      if (entry) await updateGstEntry(ledger, entry.id, values);
      else await createGstEntry(ledger, values);
      toast.success(entry ? 'Changes saved' : 'GST entry added');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Couldn’t save the entry. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        noValidate
        onSubmit={handleSubmit(submit)}
        className="relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-float sm:max-w-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <h2 id={titleId} className="text-base font-semibold text-fg">
            {entry ? 'Edit entry' : 'New entry'}
            <span className="ml-2 text-sm font-normal text-muted">{GST_LEDGERS[ledger].title}</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </div>

        <div className="space-y-7 overflow-y-auto p-5 sm:p-6">
          <FormSection title="Company">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name" htmlFor="companyName" error={errors.companyName?.message}>
                <Input
                  id="companyName"
                  autoFocus={!entry}
                  placeholder="e.g. PRAVEN TECHNO SERVICES"
                  aria-invalid={Boolean(errors.companyName)}
                  {...register('companyName', requiredText('Enter the company name'))}
                />
              </Field>
              <Field label="GST number" htmlFor="gstNo" optional>
                <Input id="gstNo" placeholder="e.g. 37BCXPK3064L1ZV" {...register('gstNo')} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Invoice">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Invoice number" htmlFor="gstInvoiceNumber" error={errors.invoiceNumber?.message}>
                <Input
                  id="gstInvoiceNumber"
                  placeholder="e.g. 440"
                  aria-invalid={Boolean(errors.invoiceNumber)}
                  {...register('invoiceNumber', requiredText('Enter the invoice number'))}
                />
              </Field>
              <Field label="Month" htmlFor="month">
                <Select id="month" {...register('month')}>
                  <option value="">—</option>
                  {MONTH_CODE_OPTIONS.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Date" htmlFor="gstDate" error={errors.date?.message}>
                <Input
                  id="gstDate"
                  type="date"
                  aria-invalid={Boolean(errors.date)}
                  {...register('date', { required: 'Choose the date' })}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Amounts" description="Balance % fills in as GST rate − share %. You can change it.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tax amount" htmlFor="taxAmount" error={errors.taxAmount?.message}>
                <CurrencyInput
                  id="taxAmount"
                  aria-invalid={Boolean(errors.taxAmount)}
                  {...register('taxAmount', {
                    validate: (value) => Number(value) > 0 || 'Enter an amount greater than ₹0',
                  })}
                />
              </Field>
              <Field label="GST rate" htmlFor="gstRate">
                <Select id="gstRate" {...register('gstRate', { onChange: followBalance })}>
                  {GST_RATES.map((rate) => (
                    <option key={rate} value={String(rate)}>
                      {rate}%
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Share %" htmlFor="sharePercent">
                <Input
                  id="sharePercent"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="7"
                  {...register('sharePercent', { onChange: followBalance })}
                />
              </Field>
              <Field label="Balance %" htmlFor="balancePercent">
                <Input
                  id="balancePercent"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="11"
                  {...register('balancePercent')}
                />
              </Field>
            </div>
            <dl className="space-y-2.5 rounded-xl border border-line bg-sunken/50 p-4 text-sm">
              <PreviewRow label={`Taxable base (tax ÷ ${Number(gstRate) || GST_RATE * 100}%)`} value={formatINR(split.taxable)} />
              <PreviewRow label="Share value" value={formatINR(split.shareValue)} />
              <PreviewRow label="Balance amount" value={formatINR(split.balanceAmount)} strong />
            </dl>
          </FormSection>

          <FormSection title="Status">
            <Field label="Payment status" htmlFor="gstStatus">
              <Select id="gstStatus" className="sm:max-w-xs" {...register('status')}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </FormSection>
        </div>

        <div className="flex items-center gap-2 border-t border-line px-5 py-4 sm:px-6">
          {entry && onDelete && (
            <Button variant="danger-ghost" icon={Trash2} onClick={() => onDelete(entry)} className="mr-auto">
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} className="ml-auto sm:ml-0">
            Cancel
          </Button>
          <Button type="submit" icon={Check} loading={isSubmitting}>
            {entry ? 'Save changes' : 'Save entry'}
          </Button>
        </div>
      </form>
    </div>
  );
}
