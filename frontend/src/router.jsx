import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { JobsPage } from './pages/JobsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { ApplicationsPage } from './pages/ApplicationsPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { useSelector } from 'react-redux';

const Protected = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  return user ? children : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: (
      <Protected>
        <AppLayout />
      </Protected>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'applications', element: <ApplicationsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'admin', element: <AdminPage /> }
    ]
  }
]);
