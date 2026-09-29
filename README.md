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
- **Profit** = PO amount − payment required
- **Net profit** = total profit − total expenses
- **Due date** defaults to invoice date + 45 days and can be edited.
- **Status**: *Pending* before the due date, *Due today*, *Overdue* after it, or *Completed* once marked as paid.
- **Reports** count orders by invoice date and expenses by expense date. Ranges up to 31 days are charted per day; longer ranges per month.

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
