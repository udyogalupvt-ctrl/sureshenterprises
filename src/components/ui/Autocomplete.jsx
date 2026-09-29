import { useId, useState } from 'react';
import { cn } from '../../lib/cn';

const MAX_OPTIONS = 6;

function Highlight({ text, query }) {
  const start = query ? text.toLowerCase().indexOf(query) : -1;
  if (start < 0) return text;
  return (
    <>
      {text.slice(0, start)}
      <mark className="bg-transparent font-semibold text-fg">{text.slice(start, start + query.length)}</mark>
      {text.slice(start + query.length)}
    </>
  );
}

/**
 * Text input that suggests previously entered values as you type (or on focus when empty).
 * Spread react-hook-form's `register(...)` onto it; pass the watched value as `currentValue`
 * and handle a chosen option (`{ value, detail?, record? }`) in `onPick`.
 */
export default function Autocomplete({
  options,
  currentValue = '',
  onPick,
  className,
  onChange,
  onBlur,
  ...inputProps
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const query = currentValue.trim().toLowerCase();
  const matches = options
    .filter(({ value }) => {
      const candidate = value.toLowerCase();
      return candidate !== query && candidate.includes(query);
    })
    .slice(0, MAX_OPTIONS);
  const expanded = open && matches.length > 0;

  const pick = (option) => {
    onPick(option);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.length) {
      event.preventDefault();
      setOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) =>
        index < 0 ? (step > 0 ? 0 : matches.length - 1) : (index + step + matches.length) % matches.length,
      );
    } else if (event.key === 'Enter' && expanded && activeIndex >= 0) {
      event.preventDefault(); // choose the suggestion instead of submitting the form
      pick(matches[activeIndex]);
    } else if (event.key === 'Escape' && expanded) {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        {...inputProps}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        className={cn('field-control', className)}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange?.(event);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setOpen(false);
        }}
        onKeyDown={handleKeyDown}
      />
      {expanded && (
        <div className="absolute inset-x-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-float">
          <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium tracking-wide text-faint uppercase">
            Previously used
          </p>
          <ul id={listId} role="listbox" className="max-h-60 overflow-y-auto">
            {matches.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                // Keep focus in the input so blur doesn't close the list before the click lands.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(option)}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm',
                  index === activeIndex ? 'bg-sunken' : 'hover:bg-sunken',
                )}
              >
                <span className="truncate text-muted">
                  <Highlight text={option.value} query={query} />
                </span>
                {option.detail && <span className="shrink-0 text-xs text-faint">{option.detail}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
