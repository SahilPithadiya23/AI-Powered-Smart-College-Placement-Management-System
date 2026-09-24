import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, BriefcaseBusiness, ChartColumn, FileText, LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react';
import { logout } from '../store/authSlice.js';
import { fetchNotifications, markNotificationRead } from '../store/appSlice.js';
import { useSocket } from '../hooks/useSocket.js';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { to: '/applications', label: 'Applications', icon: FileText },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/analytics', label: 'Analytics', icon: ChartColumn },
  { to: '/admin', label: 'Admin', icon: Settings }
];

export const AppLayout = () => {
  useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const notifications = useSelector((state) => state.app.notifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const unreadNotifications = notifications.filter((notification) => !notification.readAt);

  const handleNotificationClick = (notification) => {
    if (!notification.readAt) dispatch(markNotificationRead(notification._id));
  };

  const visibleLinks = links.filter((link) => link.to !== '/admin' || ['admin', 'placement_officer'].includes(user?.role));

  return (
    <div className="min-h-screen bg-[#eef3f6]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center px-5 text-lg font-semibold text-ink">PlacementOS</div>
        <nav className="space-y-1 px-3">
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div>
            <p className="text-sm text-slate-500">{user?.role?.replace('_', ' ')}</p>
            <h1 className="text-lg font-semibold text-ink">{user?.name}</h1>
          </div>
          <div className="relative flex items-center gap-3">
            <button
              className="focus-ring relative rounded-md border border-slate-200 p-2 text-slate-700"
              onClick={() => setNotificationsOpen((isOpen) => !isOpen)}
              aria-expanded={notificationsOpen}
              aria-controls="notification-menu"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotifications.length > 0 && <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-accent text-[10px] text-white">{unreadNotifications.length}</span>}
            </button>
            {notificationsOpen && (
              <div id="notification-menu" className="absolute right-12 top-12 z-20 w-80 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg sm:right-0">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="font-semibold text-ink">Notifications</h2>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-slate-500">You have no notifications.</p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 ${!notification.readAt ? 'bg-blue-50/60' : ''}`}
                      >
                        <p className="text-sm font-medium text-ink">{notification.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                        <p className="mt-1 text-xs text-slate-400">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            <button
              className="focus-ring rounded-md border border-slate-200 p-2 text-slate-700"
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
