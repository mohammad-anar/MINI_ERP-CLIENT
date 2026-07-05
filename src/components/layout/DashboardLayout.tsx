import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import {
  initiateSocketConnection,
  disconnectSocket,
} from '../../helpers/socket';
import { baseApi } from '../../redux/api/baseApi';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  Bell,
  LogOut,
  Menu,
  X,
  UserPlus,
} from 'lucide-react';
import { useGetNotificationsQuery } from '../../redux/api/notificationApi';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveToasts, setLiveToasts] = useState<{ id: string; title: string; message: string; type: string }[]>([]);

  // RTK Query for fetching notifications
  const { data: notificationsResponse, refetch: refetchNotifications } = useGetNotificationsQuery(undefined, {
    skip: !user,
  });

  const notifications = notificationsResponse?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  useEffect(() => {
    if (user) {
      // Connect socket
      const socket = initiateSocketConnection(user.id, user.role);

      // Listen for live notification alerts
      socket.on('notification', (data: any) => {
        console.log('🔔 Received live notification alert:', data);
        
        // Push notification toast
        const toastId = Date.now().toString();
        setLiveToasts((prev) => [
          ...prev,
          {
            id: toastId,
            title: data.title,
            message: data.message,
            type: data.type,
          },
        ]);

        // Auto remove toast after 6 seconds
        setTimeout(() => {
          setLiveToasts((prev) => prev.filter((t) => t.id !== toastId));
        }, 6000);

        // Force refetch notifications to update lists & counters
        refetchNotifications();
        
        // Also force refetch dashboard data if any
        dispatch(baseApi.util.invalidateTags(['Dashboard', 'Products', 'Sales']));
      });
    }

    return () => {
      disconnectSocket();
    };
  }, [user, refetchNotifications, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      name: 'Products',
      path: '/products',
      icon: Package,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      name: 'Create Sale',
      path: '/create-sale',
      icon: ShoppingCart,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      name: 'Sales History',
      path: '/sales-history',
      icon: History,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: 'Create Staff',
      path: '/create-staff',
      icon: UserPlus,
      roles: ['SUPER_ADMIN', 'ADMIN'],
    },
  ];

  const allowedNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      
      {/* ─── LIVE FLOATING TOASTS ──────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {liveToasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex flex-col p-4 rounded-xl shadow-lg border bg-white dark:bg-slate-800 border-purple-500/20 text-slate-900 dark:text-slate-100 animate-slide-in duration-300 backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-purple-600 dark:text-purple-400 text-sm flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
                {toast.title}
              </span>
              <button
                onClick={() => setLiveToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* ─── SIDEBAR (DESKTOP) ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg">
            M
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
            Mini ERP
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.name}</span>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-lg">
              {navItems.find((n) => n.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-purple-600 ring-2 ring-white dark:ring-slate-950" />
              )}
            </Link>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Profile pill */}
            <div className="flex items-center gap-2.5">
              <img
                src={user?.image || 'https://i.ibb.co/z5YHLV9/profile.png'}
                alt="Profile"
                className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
                onError={(e) => {
                  (e.target as any).src = 'https://i.ibb.co/z5YHLV9/profile.png';
                }}
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* overlay */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* sidebar content */}
            <div className="relative flex flex-col w-64 bg-white dark:bg-slate-950 h-full z-10 border-r border-slate-200 dark:border-slate-800 animate-slide-in-left">
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  Mini ERP
                </span>
                <button onClick={() => setMobileOpen(false)} className="p-2 cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {allowedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="flex-1">{item.name}</span>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-600 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
