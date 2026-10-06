import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Plus, Receipt, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ORDER = { to: '/purchase-orders/new', label: 'Purchase order', icon: FileText };
const EXPENSE = { to: '/expenses/new', label: 'Expense', icon: Receipt };
const GST_ENTRY = { to: '/gst-others?new=1', label: 'GST entry', icon: ReceiptText };
const OWN_GST_ENTRY = { to: '/own-gst?new=1', label: 'Own GST entry', icon: ReceiptText };

const FAB_CLASSES =
  'flex h-14 items-center gap-2 rounded-full bg-accent pr-6 pl-5 font-semibold text-accent-fg shadow-float transition-transform active:scale-95';

/**
 * Mobile "+ Add" button. On the orders, expenses and GST pages it adds that record type;
 * elsewhere it opens a small menu to choose one.
 */
export default function AddButton() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const target = pathname.startsWith('/purchase-orders')
    ? ORDER
    : pathname.startsWith('/expenses')
      ? EXPENSE
      : pathname.startsWith('/gst-others')
        ? GST_ENTRY
        : pathname.startsWith('/own-gst')
          ? OWN_GST_ENTRY
          : null;

  return (
    <div className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 lg:hidden">
      {target ? (
        <Link to={target.to} aria-label={`Add ${target.label.toLowerCase()}`} className={FAB_CLASSES}>
          <Plus className="size-5" strokeWidth={2.5} />
          Add
        </Link>
      ) : (
        <>
          <AnimatePresence>
            {open && (
              <>
                <motion.button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 -z-10 bg-canvas/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.ul
                  className="absolute right-0 bottom-[4.25rem] flex flex-col items-end gap-2"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{ visible: { transition: { staggerChildren: 0.05, staggerDirection: -1 } } }}
                >
                  {[EXPENSE, ORDER].map(({ to, label, icon: Icon }) => (
                    <motion.li
                      key={to}
                      variants={{
                        hidden: { opacity: 0, y: 8, scale: 0.96 },
                        visible: { opacity: 1, y: 0, scale: 1 },
                      }}
                    >
                      <Link
                        to={to}
                        onClick={() => setOpen(false)}
                        className="flex h-11 items-center gap-2.5 rounded-full border border-line bg-surface pr-4 pl-3.5 text-sm font-medium whitespace-nowrap text-fg shadow-float"
                      >
                        <Icon className="size-4 text-accent-ink" />
                        {label}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </>
            )}
          </AnimatePresence>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className={FAB_CLASSES}>
            <motion.span animate={{ rotate: open ? 45 : 0 }} className="grid">
              <Plus className="size-5" strokeWidth={2.5} />
            </motion.span>
            {open ? 'Close' : 'Add'}
          </button>
        </>
      )}
    </div>
  );
}
