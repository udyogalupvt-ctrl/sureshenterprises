/**
 * Unique non-empty values of `key` as autocomplete options, newest first
 * (records arrive newest first). Each option keeps the record it came from.
 */
export function previousValues(records, key, describe) {
  const seen = new Set();
  const options = [];

  for (const record of records) {
    const value = record[key]?.trim();
    if (!value || seen.has(value.toLowerCase())) continue;
    seen.add(value.toLowerCase());
    options.push({ value, detail: describe?.(record), record });
  }
  return options;
}

// Prefix, the last run of digits, and any non-digit suffix: "INV-0142" → "INV-", "0142", "".
const NUMBERED = /^(.*?)(\d+)(\D*)$/;

/**
 * The next invoice number in the most recent series, keeping zero padding: INV-0142 → INV-0143.
 * Uses the highest number in that series, so entering an older invoice doesn't cause a repeat.
 * Returns '' when no numbered invoice exists yet.
 */
export function nextInvoiceNumber(orders) {
  const parsed = orders.map((order) => order.invoiceNumber?.trim().match(NUMBERED)).filter(Boolean);
  if (!parsed.length) return '';

  const [, prefix, , suffix] = parsed[0];
  let highest = parsed[0][2];
  for (const [, otherPrefix, digits, otherSuffix] of parsed) {
    if (otherPrefix === prefix && otherSuffix === suffix && BigInt(digits) > BigInt(highest)) highest = digits;
  }
  return `${prefix}${String(BigInt(highest) + 1n).padStart(highest.length, '0')}${suffix}`;
}
