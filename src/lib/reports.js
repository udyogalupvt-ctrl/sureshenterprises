import { round2, summarize } from './calculations';
import { parseISODate, toISODate } from './format';

export const PERIODS = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom' },
];

const DAY_MS = 86_400_000;

/** Ranges up to this many days are charted per day, longer ranges per month. */
const MAX_DAILY_BUCKETS = 31;

const axisDay = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
const axisMonth = new Intl.DateTimeFormat('en-IN', { month: 'short' });
const axisMonthYear = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' });
const fullDay = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const fullMonth = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });
const rangeFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

export function currentMonthRange() {
  const now = new Date();
  return { start: toISODate(startOfMonth(now)), end: toISODate(now) };
}

export const formatRange = ({ start, end }) =>
  rangeFormat.formatRange(parseISODate(start), parseISODate(end));

const isWithin = (iso, range) => Boolean(iso) && iso >= range.start && iso <= range.end;

function resolveRange(period, custom, purchaseOrders, expenses) {
  const now = new Date();
  const thisMonth = currentMonthRange();

  switch (period) {
    case 'last-month':
      return {
        start: toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        end: toISODate(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    case 'custom':
      if (!custom.start || !custom.end) return thisMonth;
      return custom.start <= custom.end ? custom : { start: custom.end, end: custom.start };
    case 'all': {
      const dates = [...purchaseOrders.map((po) => po.invoiceDate), ...expenses.map((e) => e.date)]
        .filter(Boolean)
        .sort();
      const first = dates[0] ?? thisMonth.start;
      const last = dates.at(-1) ?? thisMonth.end;
      return {
        start: first < thisMonth.start ? first : thisMonth.start,
        end: last > thisMonth.end ? last : thisMonth.end,
      };
    }
    default:
      return thisMonth;
  }
}

/** Buckets profit and expenses per day or month, including empty buckets so gaps read as zero. */
function buildTimeline(purchaseOrders, expenses, range) {
  const days = Math.round((parseISODate(range.end) - parseISODate(range.start)) / DAY_MS) + 1;
  const daily = days <= MAX_DAILY_BUCKETS;
  const spansYears = range.start.slice(0, 4) !== range.end.slice(0, 4);
  const keyOf = (iso) => (daily ? iso : iso.slice(0, 7));

  const buckets = new Map();
  const cursor = parseISODate(range.start);
  if (!daily) cursor.setDate(1);
  const lastKey = keyOf(range.end);

  for (let key = keyOf(toISODate(cursor)); key <= lastKey; key = keyOf(toISODate(cursor))) {
    buckets.set(key, {
      key,
      label: (daily ? axisDay : spansYears ? axisMonthYear : axisMonth).format(cursor),
      fullLabel: (daily ? fullDay : fullMonth).format(cursor),
      profit: 0,
      expenses: 0,
    });
    if (daily) cursor.setDate(cursor.getDate() + 1);
    else cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const po of purchaseOrders) {
    const bucket = buckets.get(keyOf(po.invoiceDate));
    if (bucket) bucket.profit += Number(po.profit) || 0;
  }
  for (const expense of expenses) {
    const bucket = buckets.get(keyOf(expense.date));
    if (bucket) bucket.expenses += Number(expense.amount) || 0;
  }

  let runningNet = 0;
  const points = [...buckets.values()].map((bucket) => {
    const net = round2(bucket.profit - bucket.expenses);
    runningNet = round2(runningNet + net);
    return { ...bucket, profit: round2(bucket.profit), expenses: round2(bucket.expenses), net, runningNet };
  });

  return { granularity: daily ? 'day' : 'month', points };
}

function groupByCategory(expenses) {
  const totals = new Map();
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + (Number(expense.amount) || 0));
  }
  const grandTotal = [...totals.values()].reduce((sum, amount) => sum + amount, 0);

  return [...totals]
    .map(([category, amount]) => ({ category, amount: round2(amount), share: grandTotal ? amount / grandTotal : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

/** POs are dated by invoice date, expenses by expense date. */
export function buildReport({ purchaseOrders, expenses, period, custom }) {
  const range = resolveRange(period, custom, purchaseOrders, expenses);
  const orders = purchaseOrders.filter((po) => isWithin(po.invoiceDate, range));
  const spent = expenses.filter((expense) => isWithin(expense.date, range));

  return {
    range,
    ...buildTimeline(orders, spent, range),
    totals: summarize(orders, spent),
    categories: groupByCategory(spent),
    orderCount: orders.length,
    expenseCount: spent.length,
  };
}
