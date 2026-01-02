import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { 
  getNotificationsByUser, 
  getUnreadNotificationCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  initializeRealNotifications
} from '../data/notifications';

export default function NotificationCenter() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = () => {
      // Initialize real notifications on first load
      initializeRealNotifications();
      
      // Reload from storage to ensure we have the latest data
      const userNotifications = getNotificationsByUser(user.userId);
      setNotifications(userNotifications);
      setUnreadCount(getUnreadNotificationCount(user.userId));
    };

    loadNotifications();

    // Listen for new notifications
    const handleNotificationCreated = () => {
      loadNotifications();
    };

    const handleNotificationUpdated = () => {
      loadNotifications();
    };

    const handleNotificationsUpdated = () => {
      loadNotifications();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('notificationCreated', handleNotificationCreated);
      window.addEventListener('notificationUpdated', handleNotificationUpdated);
      window.addEventListener('notificationsUpdated', handleNotificationsUpdated);
      
      // Poll for updates every 3 seconds
      const interval = setInterval(loadNotifications, 3000);
      
      return () => {
        window.removeEventListener('notificationCreated', handleNotificationCreated);
        window.removeEventListener('notificationUpdated', handleNotificationUpdated);
        window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
        clearInterval(interval);
      };
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    // Navigate to link if available (don't mark as read automatically)
    if (notification.linkURL) {
      setIsOpen(false);
      router.push(notification.linkURL);
    }
  };

  const handleMarkAsRead = (e, notification) => {
    e.stopPropagation(); // Prevent navigation when clicking the button
    
    if (!notification.isRead) {
      markNotificationAsRead(notification.inAppNotificationId);
      // Reload notifications to update UI
      const userNotifications = getNotificationsByUser(user.userId);
      setNotifications(userNotifications);
      setUnreadCount(getUnreadNotificationCount(user.userId));
    }
  };

  const handleMarkAllAsRead = () => {
    if (user) {
      markAllNotificationsAsRead(user.userId);
      // Reload notifications to update UI
      const userNotifications = getNotificationsByUser(user.userId);
      setNotifications(userNotifications);
      setUnreadCount(getUnreadNotificationCount(user.userId));
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-mint-dark-text hover:text-mint-primary-blue transition-all duration-200 rounded-lg hover:bg-gray-50 group"
        aria-label="Notifications"
      >
        <svg 
          className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'scale-110' : 'group-hover:scale-105'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold leading-none text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-mint-primary-blue to-mint-secondary-blue">
            <h3 className="text-lg font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-white hover:text-gray-100 font-medium px-3 py-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 bg-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-mint-dark-text/60">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.inAppNotificationId}
                    className={`group relative px-4 py-4 hover:bg-white transition-all duration-200 ${
                      !notification.isRead ? 'bg-blue-50/70 border-l-4 border-mint-primary-blue' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Status Indicator */}
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1.5 ${
                        !notification.isRead 
                          ? 'bg-mint-primary-blue ring-2 ring-mint-primary-blue/30 animate-pulse' 
                          : 'bg-gray-300'
                      }`}></div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${
                          !notification.isRead 
                            ? 'font-semibold text-gray-900' 
                            : 'font-medium text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(e, notification)}
                              className="text-xs px-2.5 py-1 bg-mint-primary-blue/10 hover:bg-mint-primary-blue/20 text-mint-primary-blue font-medium rounded-md transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Clickable overlay for navigation */}
                    {notification.linkURL && (
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="View notification"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

