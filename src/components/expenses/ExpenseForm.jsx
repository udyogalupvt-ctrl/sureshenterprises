import { AnimatePresence, motion } from 'framer-motion';
import { Check, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { uploadImage } from '../../lib/cloudinary';
import { cn } from '../../lib/cn';
import { BANKED_MODES, PAYMENT_MODES } from '../../lib/constants';
import { toISODate } from '../../lib/format';
import { previousValues } from '../../lib/suggestions';
import { saveCategory } from '../../services/categories';
import { createExpense, updateExpense } from '../../services/expenses';
import Autocomplete from '../ui/Autocomplete';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { Field, FormActions, Input, Select, Textarea } from '../ui/Form';
import ProofUpload from './ProofUpload';

const NEW_CATEGORY = '__new__';
const MAX_PROOF_BYTES = 15 * 1024 * 1024;

const ERROR_MESSAGES = {
  upload: 'Couldn’t upload the photo. Check your connection and try again.',
  save: 'Couldn’t save the expense. Please try again.',
};

/** Keeps a saved value selectable even if it's no longer in the standard list. */
const withCurrent = (options, current) => (current && !options.includes(current) ? [...options, current] : options);

/** `previousExpenses` (newest first) feed the title suggestions. */
export default function ExpenseForm({ expense, categories, previousExpenses, onSaved, onDelete }) {
  const isNew = !expense;
  const [proof, setProof] = useState(expense?.proofUrl ? { file: null, url: expense.proofUrl } : null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm({
    defaultValues: {
      amount: expense ? String(expense.amount) : '',
      title: expense?.title ?? '',
      category: expense?.category ?? '',
      newCategory: '',
      date: expense?.date ?? toISODate(),
      paymentMode: expense?.paymentMode ?? PAYMENT_MODES[0],
      bank: expense?.bank ?? '',
      note: expense?.note ?? '',
    },
  });

  const [title, category, paymentMode, bank] = useWatch({
    control,
    name: ['title', 'category', 'paymentMode', 'bank'],
  });
  const showBank = BANKED_MODES.includes(paymentMode);

  const titleOptions = useMemo(
    () => previousValues(previousExpenses, 'title', (item) => item.category),
    [previousExpenses],
  );
  const bankOptions = useMemo(() => previousValues(previousExpenses, 'bank'), [previousExpenses]);

  /** Picking a past title also copies its category and payment mode, unless a category is already chosen. */
  const pickTitle = ({ value, record }) => {
    setValue('title', value, { shouldDirty: true });
    if (getValues('category') || !categories.includes(record.category)) return;
    setValue('category', record.category, { shouldDirty: true, shouldValidate: isSubmitted });
    if (PAYMENT_MODES.includes(record.paymentMode)) setValue('paymentMode', record.paymentMode, { shouldDirty: true });
    if (record.bank) setValue('bank', record.bank, { shouldDirty: true });
  };

  const selectProof = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    if (file.size > MAX_PROOF_BYTES) {
      toast.error('That photo is too large. The limit is 15 MB.');
      return;
    }
    if (proof?.file) URL.revokeObjectURL(proof.url);
    setProof({ file, url: URL.createObjectURL(file) });
  };

  const removeProof = () => {
    if (proof?.file) URL.revokeObjectURL(proof.url);
    setProof(null);
  };

  /** Reuses an existing category that differs only by case, otherwise saves a new one. */
  const resolveCategory = async (name) => {
    const trimmed = name.trim();
    const existing = categories.find((option) => option.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    await saveCategory(trimmed);
    return trimmed;
  };

  const submit = async ({ newCategory, ...values }) => {
    let step = 'save';
    try {
      const resolvedCategory = values.category === NEW_CATEGORY ? await resolveCategory(newCategory) : values.category;

      let proofUrl = proof?.url ?? '';
      if (proof?.file) {
        step = 'upload';
        setUploading(true);
        proofUrl = await uploadImage(proof.file);
        setUploading(false);
        step = 'save';
      }

      const record = {
        ...values,
        bank: BANKED_MODES.includes(values.paymentMode) ? values.bank : '',
        category: resolvedCategory,
        proofUrl,
      };
      if (isNew) await createExpense(record);
      else await updateExpense(expense.id, record);

      toast.success(isNew ? 'Expense added' : 'Changes saved');
      onSaved();
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error(ERROR_MESSAGES[step]);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <Card className="space-y-5 p-5 sm:p-6">
        <Field label="Amount" htmlFor="amount" error={errors.amount?.message}>
          <div
            className={cn(
              'flex items-center gap-2 rounded-xl border bg-surface px-4 shadow-soft transition focus-within:ring-4',
              errors.amount
                ? 'border-rose-500 focus-within:ring-rose-500/15'
                : 'border-line focus-within:border-accent focus-within:ring-accent/15',
            )}
          >
            <span className="text-2xl font-medium text-faint">₹</span>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0"
              autoFocus={isNew}
              onWheel={(event) => event.currentTarget.blur()}
              aria-invalid={Boolean(errors.amount)}
              className="h-16 w-full min-w-0 bg-transparent text-3xl font-semibold tracking-tight text-fg outline-none placeholder:text-faint/50"
              {...register('amount', { validate: (value) => Number(value) > 0 || 'Enter an amount greater than ₹0' })}
            />
          </div>
        </Field>

        <Field label="Title" htmlFor="title" optional>
          <Autocomplete
            id="title"
            placeholder="e.g. Diesel for delivery van"
            options={titleOptions}
            currentValue={title}
            onPick={pickTitle}
            {...register('title')}
          />
        </Field>

        <Field label="Category" htmlFor="category" error={errors.category?.message}>
          <Select
            id="category"
            aria-invalid={Boolean(errors.category)}
            {...register('category', { required: 'Choose a category' })}
          >
            <option value="" disabled>
              Select a category
            </option>
            {withCurrent(categories, expense?.category).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value={NEW_CATEGORY}>+ Add new category</option>
          </Select>
        </Field>

        <AnimatePresence initial={false}>
          {category === NEW_CATEGORY && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="-m-1 overflow-hidden p-1"
            >
              <Field
                label="New category name"
                htmlFor="newCategory"
                hint="It will be saved and offered next time."
                error={errors.newCategory?.message}
              >
                <Input
                  id="newCategory"
                  autoFocus
                  placeholder="e.g. Packaging"
                  aria-invalid={Boolean(errors.newCategory)}
                  {...register('newCategory', {
                    validate: (value, values) =>
                      values.category !== NEW_CATEGORY ||
                      /[a-z0-9].*[a-z0-9]/i.test(value) ||
                      'Enter a name with at least 2 letters or numbers',
                  })}
                />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" htmlFor="date" error={errors.date?.message}>
            <Input
              id="date"
              type="date"
              max={toISODate()}
              aria-invalid={Boolean(errors.date)}
              {...register('date', {
                required: 'Choose a date',
                validate: (value) => value <= toISODate() || 'The date can’t be in the future',
              })}
            />
          </Field>
          <Field label="Payment mode" htmlFor="paymentMode" error={errors.paymentMode?.message}>
            <Select id="paymentMode" {...register('paymentMode', { required: 'Choose a payment mode' })}>
              {withCurrent(PAYMENT_MODES, expense?.paymentMode).map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {showBank && (
          <Field label="Bank" htmlFor="bank" optional hint="Which account paid, e.g. BOB.">
            <Autocomplete
              id="bank"
              placeholder="e.g. BOB"
              options={bankOptions}
              currentValue={bank}
              onPick={({ value }) => setValue('bank', value, { shouldDirty: true })}
              {...register('bank')}
            />
          </Field>
        )}

        <Field label="Note" htmlFor="note" optional>
          <Textarea id="note" rows={3} placeholder="Anything worth remembering" {...register('note')} />
        </Field>
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-10">
        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold text-fg">Proof</p>
          <ProofUpload previewUrl={proof?.url} onSelect={selectProof} onRemove={removeProof} />
        </Card>

        <FormActions>
          <Button variant="secondary" to="/expenses">
            Cancel
          </Button>
          <Button type="submit" icon={Check} loading={isSubmitting}>
            {uploading ? 'Uploading…' : isNew ? 'Save expense' : 'Save changes'}
          </Button>
        </FormActions>

        {!isNew && (
          <Button variant="danger-ghost" icon={Trash2} onClick={onDelete} className="w-full">
            Delete expense
          </Button>
        )}
      </aside>
    </form>
  );
}
