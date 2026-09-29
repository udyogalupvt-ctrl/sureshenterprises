import { motion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '../../lib/cn';

export default function SegmentedControl({ options, value, onChange, label, className }) {
  const pillId = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex rounded-xl border border-line bg-sunken p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex h-8 flex-1 items-center justify-center rounded-lg px-3 text-[13px] font-medium whitespace-nowrap transition-colors',
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
            <span className="relative">
              {option.label}
              {option.count !== undefined && (
                <span className="ml-1.5 text-faint tabular-nums">{option.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
