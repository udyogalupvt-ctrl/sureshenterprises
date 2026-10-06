export const GST_RATE = 0.18;

/** Days between invoice date and the default due date. */
export const PAYMENT_TERM_DAYS = 45;

export const DEFAULT_CATEGORIES = [
  'Transport',
  'Fuel',
  'Salary',
  'Interest',
  'Office',
  'Food',
  'Material',
  'Maintenance',
  'Other',
];

export const PAYMENT_MODES = ['Bank', 'UPI', 'Cash', 'Card'];

/** Older records used these names; they read as the current mode. */
export const LEGACY_PAYMENT_MODES = { 'Bank Transfer': 'Bank' };

/** Modes that go through a bank account, so the bank is worth recording. */
export const BANKED_MODES = ['Bank', 'UPI', 'Card'];
