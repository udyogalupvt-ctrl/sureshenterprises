# Suresh Enterprises — Profit Tracker

Track purchase orders, expenses and real net profit. Built with React, Vite, Tailwind CSS, Firebase and Cloudinary.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 and sign in with the existing Firebase account. There is no sign-up page.

## Scripts

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server                 |
| `npm run build`   | Production build into `dist/`        |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Lint with oxlint                     |

## How the numbers work

- **GST** = PO amount × 18%
- **Net profit** (per order) = PO amount − GST − payment required. Payment required can be left empty when it isn't known yet: it shows as **P** and counts as ₹0.
- **Net profit** (dashboard) = total net profit − total expenses
- **Month** = the invoice date's month (e.g. SEP).
- **GST others / Own GST** (same layout, separate lists, date required): tax ÷ GST rate = taxable base; share value = base × share %; balance amount = base × balance %.
- **Due date** defaults to invoice date + 45 days and can be edited.
- **Status**: *Pending* before the due date, *Due today*, *Overdue* after it, or *Completed* once marked as paid. Tap any status badge (orders list, table or dashboard) to switch between *Awaiting payment* and *Completed* without opening the order.
- **Suggestions**: PO number, invoice number and expense title suggest values you've entered before. A new order's invoice number is pre-filled with the next number in your latest series (INV-0142 → INV-0143). Picking a past expense title also fills its category and payment mode if no category is chosen yet.
- **Theme**: Light (default), Dark or System, saved per device.
- **Reports** count orders by invoice date and expenses by expense date. Ranges up to 31 days are charted per day; longer ranges per month.
- **Export to Excel** (Reports page): everything in one .xlsx file (Summary, Purchase orders, Expenses, GST others, Own GST sheets) or any one of them as its own file, for the period selected. GST sheets are matched by their month.

## Project structure

```
src/
  lib/          Firebase and Cloudinary setup, formatting, business calculations, report maths
  services/     Firestore reads and writes (auth, purchase orders, expenses, categories)
  context/      Signed-in user, theme, and one live data subscription shared by all pages
  hooks/        URL-backed filter state
  components/
    ui/         Buttons, form controls, cards, dialogs, skeletons, empty states
    layout/     Sidebar (desktop), bottom nav and + Add button (mobile), app shell
    purchase-orders/  expenses/  reports/
  pages/        Login, Dashboard, Purchase orders, Expenses, Reports, and the two editors
```

## Data

All records are stored under the signed-in account:

```
users/{uid}/purchase_orders/{id}   poNumber, invoiceNumber, invoiceDate, dueDate, poAmount,
                                   paymentRequired, gst, profit, completed, createdAt
users/{uid}/expenses/{id}          title, amount, category, date, paymentMode, note, proofUrl, createdAt
users/{uid}/categories/{id}        name, createdAt
```

Dates are stored as `YYYY-MM-DD` strings. Proof photos are compressed in the browser, uploaded to Cloudinary (unsigned preset `sureshenterprises`), and only the returned URL is saved.

## Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy
```

This publishes `dist/` to Firebase Hosting (with the single-page-app rewrite) and deploys `firestore.rules`, which lets each account read and write only its own data.

After the first deploy, add your hosting domain under **Firebase Console → Authentication → Settings → Authorized domains** if it isn't listed already.
