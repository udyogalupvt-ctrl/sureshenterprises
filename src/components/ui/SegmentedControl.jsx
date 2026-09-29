import { motion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '../../lib/cn';

/** `iconOnly` shows each option's icon with its label kept for screen readers and tooltips. */
export default function SegmentedControl({ options, value, onChange, label, iconOnly = false, className }) {
  const pillId = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex rounded-xl border border-line bg-sunken p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={iconOnly ? option.label : undefined}
            title={iconOnly ? option.label : undefined}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex h-8 flex-1 items-center justify-center rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors',
              iconOnly ? 'px-2' : 'px-3',
              active ? 'text-fg' : 'text-muted hover:text-fg',
            )}
          >
            {active && (
              <motion.span
                layoutId={pillId}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                className="absolute inset-0 rounded-lg border border-line bg-raised shadow-soft"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {Icon && <Icon className="size-4" />}
              {!iconOnly && option.label}
              {option.count !== undefined && <span className="text-faint tabular-nums">{option.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
