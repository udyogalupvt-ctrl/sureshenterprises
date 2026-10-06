import { useCallback, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { getDueAlerts } from '../lib/dueAlerts';
import { toISODate } from '../lib/format';

const STORAGE_KEY = 'due-reminder-seen';

function readSeen() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Payment reminders: opens by itself once a day when something is overdue or due soon,
 * and can be reopened from the bell at any time.
 */
export function useDueReminder() {
  const { purchaseOrders, loading } = useData();
  const today = toISODate();
  const alerts = useMemo(() => getDueAlerts(purchaseOrders, today), [purchaseOrders, today]);
  const [seenOn, setSeenOn] = useState(readSeen);
  const [openedByUser, setOpenedByUser] = useState(false);

  const autoOpen = !loading && alerts.count > 0 && seenOn !== today;

  const open = useCallback(() => setOpenedByUser(true), []);
  const close = useCallback(() => {
    setOpenedByUser(false);
    setSeenOn(today);
    try {
      window.localStorage.setItem(STORAGE_KEY, today);
    } catch {
      // Ignored: it will simply show again next time.
    }
  }, [today]);

  return { alerts, isOpen: openedByUser || autoOpen, open, close };
}
