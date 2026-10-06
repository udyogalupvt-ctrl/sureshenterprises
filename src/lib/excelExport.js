import { getPOStatus, round2 } from './calculations';
import { GST_RATE } from './constants';
import { MONTH_CODE_OPTIONS, parseISODate, toISODate } from './format';
import { formatRange } from './reports';

const MONEY = '#,##0.00'; // Excel applies the viewer's digit grouping, so Indian setups see 2,85,000.00
const PERCENT = '0.00"%"';
const DATE = 'dd-mm-yyyy';

const HEADER_STYLE = { fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#1F5F46' };
const TOTAL_STYLE = { fontWeight: 'bold', backgroundColor: '#E8F0EC' };
const TITLE_STYLE = { fontWeight: 'bold', fontSize: 14 };
const SECTION_STYLE = { fontWeight: 'bold', backgroundColor: '#E8F0EC' };

const STATUS_LABELS = { completed: 'Completed', pending: 'Pending', dueToday: 'Due today', overdue: 'Overdue' };

const isWithin = (iso, range) => Boolean(iso) && iso >= range.start && iso <= range.end;

/** Excel stores dates without a time zone, so build them at UTC midnight to keep the calendar day. */
function excelDate(iso) {
  if (!iso) return null;
  const date = parseISODate(iso);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/** Month codes (SEP, OCT…) covered by a date range. */
function monthCodesIn(range) {
  const codes = new Set();
  const cursor = parseISODate(range.start);
  cursor.setDate(1);
  const last = range.end.slice(0, 7);
  while (toISODate(cursor).slice(0, 7) <= last && codes.size < 12) {
    codes.add(MONTH_CODE_OPTIONS[cursor.getMonth()]);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return codes;
}

/**
 * The records an export covers: orders by invoice date and expenses by date, as on the Reports page.
 * GST entries have a month code but no invoice date, so they're matched by month.
 */
export function selectExportData({ purchaseOrders, expenses, gstOthers, ownGst, range, allTime }) {
  if (allTime) return { orders: purchaseOrders, expenses, gstOthers, ownGst };
  const months = monthCodesIn(range);
  return {
    orders: purchaseOrders.filter((order) => isWithin(order.invoiceDate, range)),
    expenses: expenses.filter((expense) => isWithin(expense.date, range)),
    gstOthers: gstOthers.filter((entry) => months.has(entry.month)),
    ownGst: ownGst.filter((entry) => months.has(entry.month)),
  };
}

const sum = (rows, key) => round2(rows.reduce((total, row) => total + (Number(row[key]) || 0), 0));

/** Columns: { header, width, value(row), type: 'text' | 'money' | 'percent' | 'date', total?: true } */
function cell(column, row) {
  const value = column.value(row);
  if (value === null || value === undefined || value === '') return null;
  // Text in a money column (P = payment not known yet) stays as text, right-aligned like the numbers.
  if (column.type === 'money' && typeof value === 'string') return { value, type: String, align: 'right' };
  if (column.type === 'money') return { value: Number(value) || 0, type: Number, format: MONEY };
  if (column.type === 'percent') return { value: Number(value) || 0, type: Number, format: PERCENT };
  if (column.type === 'date') return { value: excelDate(value), type: Date, format: DATE };
  return { value: String(value), type: String };
}

function tableSheet(name, columns, rows) {
  const header = columns.map((column) => ({ value: column.header, ...HEADER_STYLE }));
  const body = rows.map((row) => columns.map((column) => cell(column, row)));
  const totals = columns.map((column, index) => {
    if (index === 0) return { value: 'TOTAL', ...TOTAL_STYLE };
    if (column.total) return { value: sum(rows, column.total), type: Number, format: MONEY, ...TOTAL_STYLE };
    return { value: '', ...TOTAL_STYLE };
  });
  return {
    sheet: name,
    data: [header, ...body, ...(rows.length ? [totals] : [])],
    columns: columns.map((column) => ({ width: column.width })),
    stickyRowsCount: 1,
  };
}

const ORDER_COLUMNS = [
  { header: 'MONTH', width: 8, value: (order) => order.month },
  { header: 'PO NO', width: 16, value: (order) => order.poNumber },
  { header: 'INV NO', width: 12, value: (order) => order.invoiceNumber },
  { header: 'INV DATE', width: 12, type: 'date', value: (order) => order.invoiceDate },
  { header: 'DUE DATE', width: 12, type: 'date', value: (order) => order.dueDate },
  { header: 'PO AMOUNT', width: 15, type: 'money', value: (order) => order.poAmount, total: 'poAmount' },
  {
    header: 'PAYMENT REQ',
    width: 15,
    type: 'money',
    value: (order) => order.paymentRequired ?? 'P',
    total: 'paymentRequired',
  },
  { header: `GST (${GST_RATE * 100}%)`, width: 14, type: 'money', value: (order) => order.gst, total: 'gst' },
  { header: 'NET PROFIT', width: 15, type: 'money', value: (order) => order.profit, total: 'profit' },
  { header: 'STATUS', width: 12, value: (order) => STATUS_LABELS[getPOStatus(order)] },
];

const EXPENSE_COLUMNS = [
  { header: 'TITLE', width: 24, value: (expense) => expense.title || expense.category },
  { header: 'CATEGORY', width: 14, value: (expense) => expense.category },
  { header: 'DATE', width: 12, type: 'date', value: (expense) => expense.date },
  { header: 'PAYMENT', width: 14, type: 'money', value: (expense) => expense.amount, total: 'amount' },
  { header: 'PAYMENT MODE', width: 14, value: (expense) => expense.paymentMode },
  { header: 'BANK', width: 10, value: (expense) => expense.bank },
  { header: 'NOTE', width: 30, value: (expense) => expense.note },
  { header: 'PROOF', width: 40, value: (expense) => expense.proofUrl },
];

const GST_COLUMNS = [
  { header: 'MONTH', width: 8, value: (entry) => entry.month },
  { header: 'COMPANY NAME', width: 36, value: (entry) => entry.companyName },
  { header: 'GST NO', width: 18, value: (entry) => entry.gstNo },
  { header: 'INV NO', width: 10, value: (entry) => entry.invoiceNumber },
  { header: 'TAX AMOUNT', width: 14, type: 'money', value: (entry) => entry.taxAmount, total: 'taxAmount' },
  { header: 'GST', width: 8, type: 'percent', value: (entry) => entry.gstRate ?? GST_RATE * 100 },
  { header: 'SHARE', width: 9, type: 'percent', value: (entry) => entry.sharePercent },
  { header: 'SHARE VALUE', width: 14, type: 'money', value: (entry) => entry.shareValue, total: 'shareValue' },
  { header: 'BALANCE', width: 9, type: 'percent', value: (entry) => entry.balancePercent },
  {
    header: 'BALANCE AMOUNT',
    width: 16,
    type: 'money',
    value: (entry) => entry.balanceAmount,
    total: 'balanceAmount',
  },
  { header: 'STATUS', width: 9, value: (entry) => (entry.status === 'paid' ? 'PAID' : 'UNPAID') },
  { header: 'DATE', width: 12, type: 'date', value: (entry) => entry.date },
];

const money = (value) => ({ value: round2(value), type: Number, format: MONEY });
const label = (value, style) => ({ value, ...style });

const gstBlock = (title, entries) => [
  [],
  [label(title, SECTION_STYLE), label('', SECTION_STYLE)],
  [label('Entries'), { value: entries.length, type: Number }],
  [label('Tax amount'), money(sum(entries, 'taxAmount'))],
  [label('Share value'), money(sum(entries, 'shareValue'))],
  [label('Balance amount'), money(sum(entries, 'balanceAmount'))],
];

function summarySheet({ orders, expenses, gstOthers, ownGst }, report, periodLabel) {
  const orderProfit = sum(orders, 'profit');
  const spent = sum(expenses, 'amount');
  const rows = [
    [label('Suresh Enterprises — Report', TITLE_STYLE)],
    [label('Period'), label(periodLabel)],
    [label('Exported on'), { value: excelDate(toISODate()), type: Date, format: DATE }],
    [],
    [label('Purchase orders', SECTION_STYLE), label('', SECTION_STYLE)],
    [label('Orders'), { value: orders.length, type: Number }],
    [label('PO amount'), money(sum(orders, 'poAmount'))],
    [label(`GST (${GST_RATE * 100}%)`), money(sum(orders, 'gst'))],
    [label('Payment required'), money(sum(orders, 'paymentRequired'))],
    [label('Order profit (PO amount − GST − payment required)'), money(orderProfit)],
    [],
    [label('Expenses', SECTION_STYLE), label('', SECTION_STYLE)],
    [label('Expenses'), { value: expenses.length, type: Number }],
    [label('Total spent'), money(spent)],
    [],
    [label('Net profit (order profit − expenses)', TOTAL_STYLE), { ...money(orderProfit - spent), ...TOTAL_STYLE }],
    ...gstBlock('GST others', gstOthers),
    ...gstBlock('Own GST', ownGst),
  ];

  if (report.categories.length) {
    rows.push([], [label('Expenses by category', HEADER_STYLE), label('Amount', HEADER_STYLE)]);
    for (const { category, amount } of report.categories) rows.push([label(category), money(amount)]);
  }

  const points = report.points.filter((point) => point.profit || point.expenses);
  if (points.length) {
    rows.push(
      [],
      ['Period', 'Order profit', 'Expenses', 'Net profit', 'Running net'].map((text) => label(text, HEADER_STYLE)),
    );
    for (const point of points) {
      rows.push([
        label(point.fullLabel),
        money(point.profit),
        money(point.expenses),
        money(point.net),
        money(point.runningNet),
      ]);
    }
  }

  return { sheet: 'Summary', data: rows, columns: [{ width: 46 }, { width: 16 }, { width: 14 }, { width: 14 }, { width: 14 }] };
}

export const EXPORT_SECTIONS = {
  summary: { label: 'Summary', fileName: 'Summary' },
  orders: { label: 'Purchase orders', fileName: 'Purchase-orders' },
  expenses: { label: 'Expenses', fileName: 'Expenses' },
  gstOthers: { label: 'GST others', fileName: 'GST-others' },
  ownGst: { label: 'Own GST', fileName: 'Own-GST' },
};

/**
 * Downloads an .xlsx file. `sections` is any of 'summary', 'orders', 'expenses', 'gstOthers', 'ownGst';
 * several sections become several sheets in one file.
 */
export async function exportToExcel({ sections, data, report, allTime }) {
  const periodLabel = allTime ? 'All time' : formatRange(report.range);
  const builders = {
    summary: () => summarySheet(data, report, periodLabel),
    orders: () => tableSheet('Purchase orders', ORDER_COLUMNS, data.orders),
    expenses: () => tableSheet('Expenses', EXPENSE_COLUMNS, data.expenses),
    gstOthers: () => tableSheet('GST others', GST_COLUMNS, data.gstOthers),
    ownGst: () => tableSheet('Own GST', GST_COLUMNS, data.ownGst),
  };
  const sheets = sections.map((section) => builders[section]());

  const name = sections.length > 1 ? 'Suresh-Enterprises' : EXPORT_SECTIONS[sections[0]].fileName;
  const period = allTime ? 'all-time' : `${report.range.start}_to_${report.range.end}`;

  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  await writeXlsxFile(sheets, { fontFamily: 'Calibri', fontSize: 11 }).toFile(`${name}_${period}.xlsx`);
}
