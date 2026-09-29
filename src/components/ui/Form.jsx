import { Check, ChevronDown, CircleAlert, Search, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Field({ label, htmlFor, optional, hint, error, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2 text-sm font-medium text-fg">
          {label}
          {optional && <span className="text-xs font-normal text-faint">Optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="flex items-center gap-1.5 text-[13px] text-rose-600 dark:text-rose-400">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="text-[13px] text-faint">{hint}</p>
      )}
    </div>
  );
}

export const Input = ({ className, ...props }) => <input className={cn('field-control', className)} {...props} />;

export const Textarea = ({ className, ...props }) => (
  <textarea className={cn('field-control h-auto min-h-24 resize-y py-2.5', className)} {...props} />
);

export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select className={cn('field-control cursor-pointer appearance-none pr-10', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-faint" />
    </div>
  );
}

export function CurrencyInput({ className, ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint">₹</span>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        placeholder="0"
        onWheel={(event) => event.currentTarget.blur()}
        className={cn('field-control pl-8 tabular-nums', className)}
        {...props}
      />
    </div>
  );
}

export function Switch({ className, ...props }) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <input type="checkbox" role="switch" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="h-6 w-10 rounded-full bg-line-strong transition-colors peer-checked:bg-accent peer-focus-visible:ring-4 peer-focus-visible:ring-accent/25"
      />
      <span
        aria-hidden="true"
        className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"
      />
    </span>
  );
}

export function Checkbox({ label, ...props }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-muted select-none">
      <span className="relative grid size-[18px] place-items-center">
        <input
          type="checkbox"
          className="peer size-full cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-surface transition outline-none checked:border-accent checked:bg-accent focus-visible:ring-4 focus-visible:ring-accent/25"
          {...props}
        />
        <Check
          strokeWidth={3}
          className="pointer-events-none absolute size-3 text-accent-fg opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      {label}
    </label>
  );
}

export function SearchInput({ value, onChange, placeholder, className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field-control pr-10 pl-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-faint transition hover:bg-sunken hover:text-fg"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function FormSection({ title, description, children }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** Pinned above the home indicator on mobile; flows inline on desktop. */
export function FormActions({ children }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-canvas/85 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl *:flex-1 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      {children}
    </div>
  );
}
