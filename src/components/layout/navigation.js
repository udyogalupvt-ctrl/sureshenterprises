import { ChartColumn, FileText, LayoutDashboard, Receipt } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/purchase-orders', label: 'Purchase orders', shortLabel: 'Orders', icon: FileText },
  { to: '/expenses', label: 'Expenses', shortLabel: 'Expenses', icon: Receipt },
  { to: '/reports', label: 'Reports', shortLabel: 'Reports', icon: ChartColumn },
];
