import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

const GAP = 6;
const EDGE = 8;
const ITEM_SELECTOR = '[role^="menuitem"]';

/**
 * A dropdown menu anchored to its trigger. It renders in a portal so table and card edges can't clip it.
 * `trigger` receives the props to spread on the trigger button; `children` receives `{ close }`.
 */
export default function Menu({ trigger, label, width = 240, children }) {
  // The trigger element is kept in state (via a callback ref) so `close` can be handed to children during render.
  const [triggerEl, setTriggerEl] = useState(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const close = useCallback(
    (restoreFocus = true) => {
      setOpen(false);
      if (restoreFocus) triggerEl?.focus({ preventScroll: true });
    },
    [triggerEl],
  );

  // Below the trigger (above if there's no room), kept inside the viewport.
  const place = useCallback(() => {
    const panel = panelRef.current;
    if (!panel || !triggerEl) return;
    const anchor = triggerEl.getBoundingClientRect();
    const fitsBelow = anchor.bottom + GAP + panel.offsetHeight <= window.innerHeight - EDGE;
    const left = Math.min(Math.max(anchor.right - width, EDGE), window.innerWidth - width - EDGE);

    panel.style.left = `${left}px`;
    panel.style.top = `${fitsBelow ? anchor.bottom + GAP : anchor.top - GAP - panel.offsetHeight}px`;
    panel.style.transformOrigin = fitsBelow ? 'top right' : 'bottom right';
  }, [triggerEl, width]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const panel = panelRef.current;
    (panel?.querySelector('[aria-checked="true"]') ?? panel?.querySelector(ITEM_SELECTOR))?.focus({
      preventScroll: true,
    });
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!panelRef.current?.contains(event.target) && !triggerEl?.contains(event.target)) close(false);
    };
    // Follow the trigger as the page scrolls or resizes; close once it has left the screen.
    const onMove = () => {
      const { top, bottom } = triggerEl.getBoundingClientRect();
      if (bottom < 0 || top > window.innerHeight) close(false);
      else place();
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, close, place, triggerEl]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' || event.key === 'Tab') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = [...panelRef.current.querySelectorAll(ITEM_SELECTOR)];
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const next = (items.indexOf(document.activeElement) + step + items.length) % items.length;
    items[next]?.focus({ preventScroll: true });
  };

  const triggerProps = {
    ref: setTriggerEl,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: (event) => {
      event.stopPropagation(); // e.g. don't also open the row this menu sits in
      setOpen((value) => !value);
    },
  };

  return (
    <>
      {trigger(triggerProps)}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              id={menuId}
              role="menu"
              aria-label={label}
              style={{ position: 'fixed', width }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="z-50 rounded-xl border border-line bg-surface p-1 shadow-float"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDown}
            >
              {children({ close })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export function MenuItem({ icon: Icon, checked = false, description, onSelect, children }) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      onClick={onSelect}
      className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-fg outline-none transition-colors hover:bg-sunken focus-visible:bg-sunken"
    >
      {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-muted" />}
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{children}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
      <Check className={cn('mt-0.5 size-4 shrink-0 text-accent-ink', !checked && 'invisible')} />
    </button>
  );
}
