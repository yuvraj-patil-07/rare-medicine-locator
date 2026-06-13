import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBell, HiCheckCircle, HiTrash, HiEye, HiInbox } from 'react-icons/hi';
import toast from 'react-hot-toast';
import notificationService from '../services/notificationService';
import { useNotifications } from '../context/NotificationContext';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/helpers';

const Notifications = () => {
  const navigate = useNavigate();
  const { refreshCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationService.getAll();
      setNotifications(data?.data?.notifications || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      refreshCount();
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      refreshCount();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      refreshCount();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      await handleMarkAsRead(n._id);
    }

    if (n.data?.reservationId) {
      navigate('/reservations');
    } else if (n.data?.medicineId) {
      navigate(`/medicines/${n.data.medicineId}`);
    } else if (n.data?.pharmacyId) {
      navigate(`/pharmacies/${n.data.pharmacyId}`);
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'reservation_approved':
      case 'pharmacy_approved':
      case 'reservation_completed':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
          dot: 'bg-emerald-500',
        };
      case 'reservation_rejected':
      case 'reservation_cancelled':
      case 'pharmacy_rejected':
        return {
          bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30',
          iconBg: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
          dot: 'bg-red-500',
        };
      case 'low_stock':
      case 'reservation_expired':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
          dot: 'bg-amber-500',
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30',
          iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
          dot: 'bg-blue-500',
        };
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 sm:px-6">
        <LoadingSkeleton type="list" count={4} />
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <HiBell className="text-primary-500" />
            Notifications
          </h1>
          <p className="text-surface-500 mt-1">
            You have {unreadNotifications.length} unread notifications.
          </p>
        </div>

        {notifications.length > 0 && unreadNotifications.length > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <HiEye className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState 
          icon="bell"
          title="All caught up!"
          message="You have no notifications at the moment."
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => {
            const styles = getTypeStyles(n.type);
            return (
              <div 
                key={n._id} 
                className={`glass-card p-5 border flex items-start justify-between gap-4 transition-all duration-300 ${
                  n.isRead ? 'opacity-75 dark:bg-surface-900/20' : `${styles.bg} shadow-sm`
                }`}
              >
                <div 
                  onClick={() => handleNotificationClick(n)}
                  className="flex items-start gap-4 flex-1 cursor-pointer"
                >
                  <div className={`p-3 rounded-xl flex-shrink-0 ${styles.iconBg}`}>
                    <HiBell className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-sm sm:text-base ${n.isRead ? 'text-surface-850 dark:text-surface-150' : 'text-surface-950 dark:text-white'}`}>
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <span className={`w-2.5 h-2.5 rounded-full ${styles.dot} animate-pulse`} />
                      )}
                    </div>
                    <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(n._id)}
                      className="p-2 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      title="Mark as read"
                    >
                      <HiEye className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(n._id)}
                    className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    title="Delete notification"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
