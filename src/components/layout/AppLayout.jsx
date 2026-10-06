import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { Outlet, useLocation, useMatch } from 'react-router-dom';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';
import { cn } from '../../lib/cn';
import { ListSkeleton } from '../ui/Skeleton';
import AddButton from './AddButton';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const { pathname } = useLocation();
  const editingOrder = useMatch('/purchase-orders/:id');
  const editingExpense = useMatch('/expenses/:id');
  // Form pages have their own pinned save bar, so the tab bar and FAB step aside.
  const isForm = Boolean(editingOrder || editingExpense);
  // Spreadsheet pages get the full width so every column fits.
  const isSheet = ['/purchase-orders', '/gst-others', '/own-gst'].includes(pathname);
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();

  return (
    <>
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-20' : 'lg:pl-64')}>
        <MobileHeader />
        <main
          className={cn(
            'mx-auto w-full px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16',
            isSheet ? 'max-w-[1440px]' : 'max-w-6xl',
            isForm ? 'pb-28' : 'pb-40',
          )}
        >
          {/* Opacity only: a transform here would break the fixed save bar on form pages. */}
          <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <Suspense fallback={<ListSkeleton rows={4} />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>
      {!isForm && (
        <>
          <BottomNav />
          <AddButton />
        </>
      )}
    </>
  );
}
