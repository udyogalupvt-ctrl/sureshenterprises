import { Check, Trash2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { calcGST, calcProfit } from '../../lib/calculations';
import { cn } from '../../lib/cn';
import { GST_RATE, PAYMENT_TERM_DAYS } from '../../lib/constants';
import { addDays, formatINR, toISODate } from '../../lib/format';
import { createPurchaseOrder, updatePurchaseOrder } from '../../services/purchaseOrders';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { CurrencyInput, Field, FormActions, FormSection, Input, Switch } from '../ui/Form';

function defaultValues(order) {
  if (!order) {
    const today = toISODate();
    return {
      poNumber: '',
      invoiceNumber: '',
      invoiceDate: today,
      dueDate: addDays(today, PAYMENT_TERM_DAYS),
      poAmount: '',
      paymentRequired: '',
      completed: false,
    };
  }
  return {
    poNumber: order.poNumber ?? '',
    invoiceNumber: order.invoiceNumber ?? '',
    invoiceDate: order.invoiceDate ?? '',
    dueDate: order.dueDate ?? '',
    poAmount: String(order.poAmount ?? ''),
    paymentRequired: String(order.paymentRequired ?? ''),
    completed: Boolean(order.completed),
  };
}

const requiredText = (message) => ({ validate: (value) => value.trim() !== '' || message });

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-fg tabular-nums">{value}</dd>
    </div>
  );
}

export default function PurchaseOrderForm({ order, onSaved, onDelete }) {
  const isNew = !order;
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultValues(order) });

  const [poAmount, paymentRequired] = useWatch({ control, name: ['poAmount', 'paymentRequired'] });
  const profit = calcProfit(poAmount, paymentRequired);

  const submit = async (values) => {
    try {
      if (isNew) await createPurchaseOrder(values);
      else await updatePurchaseOrder(order.id, values);
      toast.success(isNew ? 'Purchase order added' : 'Changes saved');
      onSaved();
    } catch (error) {
      console.error(error);
      toast.error('Couldn’t save the order. Please try again.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <Card className="space-y-8 p-5 sm:p-6">
        <FormSection title="Order details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="PO number" htmlFor="poNumber" error={errors.poNumber?.message}>
              <Input
                id="poNumber"
                autoComplete="off"
                placeholder="e.g. 4501928374"
                aria-invalid={Boolean(errors.poNumber)}
                {...register('poNumber', requiredText('Enter the PO number'))}
              />
            </Field>
            <Field label="Invoice number" htmlFor="invoiceNumber" error={errors.invoiceNumber?.message}>
              <Input
                id="invoiceNumber"
                autoComplete="off"
                placeholder="e.g. INV-0142"
                aria-invalid={Boolean(errors.invoiceNumber)}
                {...register('invoiceNumber', requiredText('Enter the invoice number'))}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Dates">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Invoice date" htmlFor="invoiceDate" error={errors.invoiceDate?.message}>
              <Input
                id="invoiceDate"
                type="date"
                aria-invalid={Boolean(errors.invoiceDate)}
                {...register('invoiceDate', {
                  required: 'Choose the invoice date',
                  onChange: (event) => {
                    if (event.target.value) {
                      setValue('dueDate', addDays(event.target.value, PAYMENT_TERM_DAYS), { shouldValidate: true });
                    }
                  },
                })}
              />
            </Field>
            <Field
              label="Due date"
              htmlFor="dueDate"
              hint={`Set to ${PAYMENT_TERM_DAYS} days after the invoice date. You can change it.`}
              error={errors.dueDate?.message}
            >
              <Input
                id="dueDate"
                type="date"
                aria-invalid={Boolean(errors.dueDate)}
                {...register('dueDate', {
                  required: 'Choose the due date',
                  validate: (value, values) =>
                    !values.invoiceDate || value >= values.invoiceDate || 'Due date can’t be before the invoice date',
                })}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Amounts">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="PO amount" htmlFor="poAmount" error={errors.poAmount?.message}>
              <CurrencyInput
                id="poAmount"
                aria-invalid={Boolean(errors.poAmount)}
                {...register('poAmount', {
                  validate: (value) => Number(value) > 0 || 'Enter an amount greater than ₹0',
                })}
              />
            </Field>
            <Field label="Payment required" htmlFor="paymentRequired" error={errors.paymentRequired?.message}>
              <CurrencyInput
                id="paymentRequired"
                aria-invalid={Boolean(errors.paymentRequired)}
                {...register('paymentRequired', {
                  validate: (value) => (value !== '' && Number(value) >= 0) || 'Enter the payment required',
                })}
              />
            </Field>
          </div>
        </FormSection>

        {!isNew && (
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-sunken/50 p-4">
            <span>
              <span className="block text-sm font-medium text-fg">Mark as completed</span>
              <span className="mt-0.5 block text-[13px] text-muted">Payment for this order has been received.</span>
            </span>
            <Switch {...register('completed')} />
          </label>
        )}
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-10">
        <Card className="p-5">
          <p className="text-[13px] font-medium text-muted">Profit</p>
          <p
            className={cn(
              'mt-1 text-3xl font-semibold tracking-tight',
              profit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-fg',
            )}
          >
            {formatINR(profit)}
          </p>
          <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
            <SummaryRow label="PO amount" value={formatINR(poAmount)} />
            <SummaryRow label="Payment required" value={`− ${formatINR(paymentRequired)}`} />
            <SummaryRow label={`GST (${GST_RATE * 100}%)`} value={formatINR(calcGST(poAmount))} />
          </dl>
        </Card>

        <FormActions>
          <Button variant="secondary" to="/purchase-orders">
            Cancel
          </Button>
          <Button type="submit" icon={Check} loading={isSubmitting}>
            {isNew ? 'Save order' : 'Save changes'}
          </Button>
        </FormActions>

        {!isNew && (
          <Button variant="danger-ghost" icon={Trash2} onClick={onDelete} className="w-full">
            Delete order
          </Button>
        )}
      </aside>
    </form>
  );
}
