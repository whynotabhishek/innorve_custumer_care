import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import AdminLogin from './components/AdminLogin';
import DashboardPage from './pages/DashboardPage';

export default function AdminApp() {
  const [adminAuthed, setAdminAuthed] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {adminAuthed ? (
        <DashboardPage />
      ) : (
        <AdminLogin onAuthenticated={setAdminAuthed} />
      )}
    </AnimatePresence>
  );
}
