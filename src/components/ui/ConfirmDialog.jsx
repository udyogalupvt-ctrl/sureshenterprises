import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Delete', onConfirm, onClose }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-float"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.35 }}
          >
            <div className="mb-4 grid size-10 place-items-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Trash2 className="size-[18px]" />
            </div>
            <h2 id={titleId} className="text-base font-semibold text-fg">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-muted">{description}</p>
            <div className="mt-6 flex gap-2 *:flex-1 sm:justify-end sm:*:flex-none">
              <Button variant="secondary" onClick={onClose} autoFocus>
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
