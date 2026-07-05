import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, BriefcaseBusiness, ChartColumn, FileText, LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react';
import { logout } from '../store/authSlice.js';
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
          <div className="flex items-center gap-3">
            <button className="focus-ring relative rounded-md border border-slate-200 p-2 text-slate-700" title="Notifications">
              <Bell size={18} />
              {notifications.length > 0 && <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-accent text-[10px] text-white">{notifications.length}</span>}
            </button>
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
