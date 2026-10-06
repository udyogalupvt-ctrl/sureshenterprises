import { GST_RATE } from './constants';
import { toISODate } from './format';

export const round2 = (value) => Math.round(value * 100) / 100;

export const calcGST = (poAmount) => round2((Number(poAmount) || 0) * GST_RATE);

/** Net profit = PO amount − GST − payment required. */
export const calcProfit = (poAmount, paymentRequired) =>
  round2((Number(poAmount) || 0) - calcGST(poAmount) - (Number(paymentRequired) || 0));

/**
 * GST Others: the tax is the GST rate (18% by default) of a taxable base, so the base is tax ÷ rate.
 * Share and balance are percentages of that base (share % + balance % = rate).
 */
export function calcGSTOthers(taxAmount, sharePercent, balancePercent, gstRate = GST_RATE * 100) {
  const rate = Number(gstRate) || GST_RATE * 100;
  const taxable = round2(((Number(taxAmount) || 0) * 100) / rate);
  return {
    taxable,
    shareValue: round2((taxable * (Number(sharePercent) || 0)) / 100),
    balanceAmount: round2((taxable * (Number(balancePercent) || 0)) / 100),
  };
}

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
