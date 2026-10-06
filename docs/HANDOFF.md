# Handoff: read this first

Suresh Enterprises profit tracker: purchase orders, expenses, GST others / own GST and reports for one business. React 19 + Vite + Tailwind 4, Firebase Auth + Firestore, Cloudinary for proof photos. Deployed with Firebase Hosting (see README).

This file holds the working state between chats, so a new chat never needs the old one. The working rules (workflows, ultracode, effort, new chat or continue) live in `~/.claude/CLAUDE.md`, not here.

- **At the start of a chat:** read this file, then do the first open item under "Next steps", unless the user asks for something else.
- **At the end of a task:** update "State", "Next steps" and "Last updated".

Last updated: 2026-10-06 (GST others as spreadsheet, Own GST section, PO data synced to the client's sheet, Excel export)

## State

- **Branch and last commit:** `main` @ `bb4e5b4`. Everything below is **uncommitted** and **not deployed**.
- **Done (2026-10-06):**
  - Collapsible desktop sidebar (remembered per device).
  - Net profit per order = PO amount − 18% GST − payment required. Payment required may be empty ("P" in the sheet) = not known yet, counts as ₹0.
  - Purchase orders, GST others and Own GST shown as spreadsheet tables (`components/ui/SheetTable.jsx`) with the client's sheet columns and a TOTAL row; orders sorted newest invoice first.
  - GST others + Own GST: one page (`pages/GstLedger.jsx`), collections `gst_others` / `own_gst`, date required, GST rate + share/balance %.
  - Expenses: payment modes Bank/UPI/Cash/Card, Bank field, Interest category ("Bank Transfer" reads as Bank).
  - Reports → Export to Excel (`lib/excelExport.js`, `write-excel-file` lazy-loaded): everything in one file or each section separately, for the chosen period.
  - Removed dead legacy files (`pages/AddPO|AddExpense|Records`, `src/contexts`, `src/config`, `components/Layout.jsx`).
- **Live data (client's Firestore) already updated** to match the client's sheets: 31 SEP orders (INV-26-155…185), 7 GST-others rows, 6 expenses. Two October orders (inv 186, 139) were not in the sheet and were left as they are.
- **How to run and check it:** `npm run build`, `npm run lint` (both clean). Screenshots were checked at 390 px and 1440 px in light and dark by signing in with the client's account in a throwaway Playwright browser (credentials are not stored anywhere; ask the user).

## Next steps (in order)

| # | Step | Ultracode? | Effort |
|---|---|---|---|
| 1 | Commit the work locally (only when the user says so) | No | Low |
| 2 | Deploy (`npm run build && firebase deploy`) once the user approves | No | Low |

**Message for the next chat:** `Read docs/HANDOFF.md and do Next step 1 (commit), then ask me before deploying.`

## Waiting on the client or the user

- [NEED: dates for GST-others invoices 439, 438 and 411 (blank in the client's sheet; date is now required when an entry is edited)]
- [NEED: should October orders 186 and 139 be renamed to the INV-26-xxx format?]
- [NEED: Own GST columns — built with the same columns as GST others; confirm or send the real sheet]

## Decisions (and why)

- 2026-10-06: Net profit subtracts 18% GST of the PO amount. Why: the client's example (285,000 − 51,300 − 152,400 = 81,300). Many orders go negative under this rule; that is expected.
- 2026-10-06: GST and net profit are recomputed on read from PO amount and payment required. Why: older saved values used the previous formula and can't drift.
- 2026-10-06: Excel export matches GST sheets by MONTH code, not date. Why: MONTH is the invoice month; the date column is the paid date.

## Gotchas

- When piping Playwright scripts into `head`, the script dies with EPIPE; redirect to a file instead.
- Firestore rules (`users/{uid}/{document=**}`) already cover new collections; no rules deploy needed for `own_gst`.
