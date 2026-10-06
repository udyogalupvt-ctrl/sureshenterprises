import { BadgeIndianRupee, ChartColumn, FileText, LayoutDashboard, Receipt, ReceiptText } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/purchase-orders', label: 'Purchase orders', shortLabel: 'Orders', icon: FileText },
  { to: '/expenses', label: 'Expenses', shortLabel: 'Expenses', icon: Receipt },
  { to: '/gst-others', label: 'GST others', shortLabel: 'GST others', icon: ReceiptText },
  { to: '/own-gst', label: 'Own GST', shortLabel: 'Own GST', icon: BadgeIndianRupee },
  { to: '/reports', label: 'Reports', shortLabel: 'Reports', icon: ChartColumn },
];
