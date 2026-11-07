import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import RequireAuth from '@/components/auth/RequireAuth';
import HomePage from '@/pages/HomePage';
import WorkersPage from '@/pages/WorkersPage';
import WorkerProfilePage from '@/pages/WorkerProfilePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import AccountPage from '@/pages/AccountPage';
import WorkerDashboardPage from '@/pages/WorkerDashboardPage';
import AdminPage from '@/pages/AdminPage';
import { EmptyState } from '@/components/ui/States';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="workers" element={<WorkersPage />} />
        <Route path="workers/:workerId" element={<WorkerProfilePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route
          path="account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route
          path="dashboard"
          element={
            <RequireAuth roles={['worker']}>
              <WorkerDashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAuth roles={['admin']}>
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={
            <div className="py-24">
              <EmptyState title="Page not found" description="The page you are looking for does not exist." />
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
