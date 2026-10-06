import { MotionConfig } from 'framer-motion';
import { lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import SplashScreen from './components/layout/SplashScreen';
import { AuthProvider, useUser } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import ExpenseEditor from './pages/ExpenseEditor';
import Expenses from './pages/Expenses';
import GstLedger from './pages/GstLedger';
import Login from './pages/Login';
import PurchaseOrderEditor from './pages/PurchaseOrderEditor';
import PurchaseOrders from './pages/PurchaseOrders';

// Charts are the heaviest dependency, so they load only when Reports is opened.
const Reports = lazy(() => import('./pages/Reports'));

const TOAST_OPTIONS = {
  duration: 3500,
  style: {
    background: 'var(--surface)',
    color: 'var(--fg)',
    border: '1px solid var(--line)',
    borderRadius: '14px',
    boxShadow: 'var(--shadow-float)',
    fontSize: '14px',
    padding: '10px 14px',
  },
  success: { iconTheme: { primary: 'var(--accent)', secondary: 'var(--accent-fg)' } },
};

function ProtectedApp() {
  const user = useUser();
  const location = useLocation();

  if (user === undefined) return <SplashScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <DataProvider>
      <AppLayout />
    </DataProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedApp />}>
                <Route index element={<Dashboard />} />
                <Route path="purchase-orders" element={<PurchaseOrders />} />
                <Route path="purchase-orders/:id" element={<PurchaseOrderEditor />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="expenses/:id" element={<ExpenseEditor />} />
                <Route path="gst-others" element={<GstLedger key="others" ledger="others" />} />
                <Route path="own-gst" element={<GstLedger key="own" ledger="own" />} />
                <Route path="reports" element={<Reports />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-center" toastOptions={TOAST_OPTIONS} />
        </MotionConfig>
      </AuthProvider>
    </ThemeProvider>
  );
}
