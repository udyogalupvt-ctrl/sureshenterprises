import { createContext, use, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { mergeCategories, subscribeCategories } from '../services/categories';
import { subscribeExpenses } from '../services/expenses';
import { subscribeGstLedger } from '../services/gstLedger';
import { subscribePurchaseOrders } from '../services/purchaseOrders';

const DataContext = createContext(null);

// Stable subscribe functions, so the live queries don't restart on every render.
const subscribeGstOthers = subscribeGstLedger('others');
const subscribeOwnGst = subscribeGstLedger('own');

function useLiveQuery(subscribe) {
  const [state, setState] = useState({ items: [], loading: true });

  useEffect(
    () =>
      subscribe(
        (items) => setState({ items, loading: false }),
        (error) => {
          // Listeners can error during sign-out; that isn't worth alarming anyone about.
          if (auth.currentUser) {
            console.error(error);
            toast.error('Couldn’t load your data. Check your connection and refresh.', { id: 'load-error' });
          }
          setState((current) => ({ ...current, loading: false }));
        },
      ),
    [subscribe],
  );

  return state;
}

/** One realtime subscription per collection, shared by every page. */
export function DataProvider({ children }) {
  const purchaseOrders = useLiveQuery(subscribePurchaseOrders);
  const expenses = useLiveQuery(subscribeExpenses);
  const categories = useLiveQuery(subscribeCategories);
  const gstOthers = useLiveQuery(subscribeGstOthers);
  const ownGst = useLiveQuery(subscribeOwnGst);

  const value = useMemo(
    () => ({
      purchaseOrders: purchaseOrders.items,
      expenses: expenses.items,
      gstOthers: gstOthers.items,
      ownGst: ownGst.items,
      categories: mergeCategories(categories.items),
      loading: purchaseOrders.loading || expenses.loading || gstOthers.loading || ownGst.loading,
    }),
    [purchaseOrders, expenses, categories, gstOthers, ownGst],
  );

  return <DataContext value={value}>{children}</DataContext>;
}

export const useData = () => use(DataContext);
