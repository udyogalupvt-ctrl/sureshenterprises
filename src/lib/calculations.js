import { GST_RATE } from './constants';
import { toISODate } from './format';

export const round2 = (value) => Math.round(value * 100) / 100;

export const calcGST = (poAmount) => round2((Number(poAmount) || 0) * GST_RATE);

export const calcProfit = (poAmount, paymentRequired) =>
  round2((Number(poAmount) || 0) - (Number(paymentRequired) || 0));

/** @returns {'completed' | 'pending' | 'dueToday' | 'overdue'} */
export function getPOStatus(po, today = toISODate()) {
  if (po.completed) return 'completed';
  if (!po.dueDate || po.dueDate > today) return 'pending';
  return po.dueDate === today ? 'dueToday' : 'overdue';
}

const sumBy = (items, key) => round2(items.reduce((total, item) => total + (Number(item[key]) || 0), 0));

/** Net profit = total profit − total expenses. */
export function summarize(purchaseOrders, expenses) {
  const profit = sumBy(purchaseOrders, 'profit');
  const spent = sumBy(expenses, 'amount');
  return {
    poAmount: sumBy(purchaseOrders, 'poAmount'),
    profit,
    expenses: spent,
    net: round2(profit - spent),
  };
}
