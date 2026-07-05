import React from 'react';
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from '../redux/api/notificationApi';
import { toast } from 'sonner';
import { getErrorMessage } from '../helpers/errorHelper';
import {
  Bell,
  AlertTriangle,
  Info,
  ShoppingCart,
  Loader2,
  CheckCheck,
} from 'lucide-react';

export const Notifications: React.FC = () => {
  const { data: response, isLoading } = useGetNotificationsQuery(undefined);
  const notifications = response?.data || [];

  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();
  const [markRead] = useMarkReadMutation();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead(undefined).unwrap();
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      const errMsg = getErrorMessage(err);
      toast.error(errMsg);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      const errMsg = getErrorMessage(err);
      toast.error(errMsg);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SALE':
        return (
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <ShoppingCart size={18} />
          </div>
        );
      case 'ADMIN_ALERT':
        return (
          <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
            <AlertTriangle size={18} />
          </div>
        );
      case 'SYSTEM':
        return (
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
            <Info size={18} />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-lg">
            <Bell size={18} />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n: any) => !n.isRead);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-xs">
      {/* Header controls */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-left">
          <h2 className="text-sm font-bold">Notifications Alert Board</h2>
          <p className="text-[10px] text-slate-500 mt-0.5">
            You have {unreadNotifications.length} unread notifications.
          </p>
        </div>

        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-all cursor-pointer disabled:opacity-50"
          >
            {isMarkingAll ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <CheckCheck size={14} /> Mark all read
              </>
            )}
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center text-slate-400">
          <Bell size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No alerts or notifications logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: any) => (
            <div
              key={notification._id}
              className={`p-4 rounded-xl border flex gap-4 transition-all ${
                notification.isRead
                  ? 'bg-white border-slate-200/60 dark:bg-slate-950 dark:border-slate-900'
                  : 'bg-purple-500/5 border-purple-500/20 shadow-sm dark:bg-purple-950/5 dark:border-purple-500/10'
              }`}
            >
              {getNotificationIcon(notification.type)}

              <div className="flex-1 text-left">
                <div className="flex items-start justify-between gap-4">
                  <h4 className={`font-semibold ${notification.isRead ? '' : 'text-purple-700 dark:text-purple-400'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notification.message}</p>
                <p className="text-[9px] text-slate-400 mt-2">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>

              {!notification.isRead && (
                <button
                  onClick={() => handleMarkRead(notification._id)}
                  className="px-2 py-1 h-fit text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white rounded cursor-pointer transition-all self-center"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
