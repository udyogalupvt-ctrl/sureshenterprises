import { createContext, use, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { auth } from '../lib/firebase';
import { mergeCategories, subscribeCategories } from '../services/categories';
import { subscribeExpenses } from '../services/expenses';
import { subscribePurchaseOrders } from '../services/purchaseOrders';

const DataContext = createContext(null);

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

  const value = useMemo(
    () => ({
      purchaseOrders: purchaseOrders.items,
      expenses: expenses.items,
      categories: mergeCategories(categories.items),
      loading: purchaseOrders.loading || expenses.loading,
    }),
    [purchaseOrders, expenses, categories],
  );

  return <DataContext value={value}>{children}</DataContext>;
}

export const useData = () => use(DataContext);
