import { DUE_ALERT_DAYS } from './constants';
import { parseISODate, toISODate } from './format';

const DAY_MS = 86_400_000;

/** Whole days from `today` to `iso`: negative when past, 0 today. */
export const daysUntil = (iso, today = toISODate()) =>
  Math.round((parseISODate(iso) - parseISODate(today)) / DAY_MS);

/**
 * Unpaid orders that need attention, soonest first:
 * overdue, due today, and due within `days` days.
 */
export function getDueAlerts(orders, today = toISODate(), days = DUE_ALERT_DAYS) {
  const groups = { overdue: [], dueToday: [], dueSoon: [] };
  for (const order of orders) {
    if (order.completed || !order.dueDate) continue;
    const daysLeft = daysUntil(order.dueDate, today);
    const item = { ...order, daysLeft };
    if (daysLeft < 0) groups.overdue.push(item);
    else if (daysLeft === 0) groups.dueToday.push(item);
    else if (daysLeft <= days) groups.dueSoon.push(item);
  }
  for (const list of Object.values(groups)) list.sort((a, b) => a.daysLeft - b.daysLeft);
  return { ...groups, count: groups.overdue.length + groups.dueToday.length + groups.dueSoon.length };
}

/** "3 days overdue", "Due today", "Due tomorrow", "Due in 4 days". */
export function describeDue(daysLeft) {
  if (daysLeft < -1) return `${-daysLeft} days overdue`;
  if (daysLeft === -1) return '1 day overdue';
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return 'Due tomorrow';
  return `Due in ${daysLeft} days`;
}
