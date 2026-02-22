import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import notificationService, { Notification } from '../services/notificationService';

export function useNotifications() {
  const { user, userUnitId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    console.log('🔄 [useNotifications.fetchNotifications] Starting fetch:', {
      userId: user?.id,
      userUnitId,
      hasUser: !!user,
      hasUnitId: !!userUnitId,
      userUnitIdType: typeof userUnitId,
      timestamp: new Date().toISOString()
    });

    // Validasi yang lebih ketat - pastikan userUnitId ada dan bukan undefined/null
    if (!user?.id || !userUnitId || userUnitId === 'undefined') {
      console.warn('⚠️ [useNotifications.fetchNotifications] Missing user or unitId, clearing notifications', {
        hasUserId: !!user?.id,
        userUnitId,
        userUnitIdType: typeof userUnitId
      });
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(user.id, userUnitId),
        notificationService.getUnreadCount(user.id, userUnitId)
      ]);

      console.log('✅ [useNotifications.fetchNotifications] Fetch complete:', {
        notificationCount: notifs.length,
        unreadCount: count,
        timestamp: new Date().toISOString()
      });

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ [useNotifications.fetchNotifications] Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, userUnitId]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || !userUnitId || userUnitId === 'undefined') {
      console.warn('⚠️ [useNotifications.markAllAsRead] Missing user or unitId');
      return;
    }

    try {
      await notificationService.markAllAsRead(user.id, userUnitId);
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [user?.id, userUnitId]);

  // Start polling on mount
  useEffect(() => {
    console.log('🎬 [useNotifications] Effect triggered:', {
      userId: user?.id,
      userUnitId,
      hasUser: !!user,
      hasUnitId: !!userUnitId,
      userUnitIdType: typeof userUnitId,
      timestamp: new Date().toISOString()
    });

    // Validasi yang lebih ketat
    if (!user?.id || !userUnitId || userUnitId === 'undefined') {
      console.warn('⚠️ [useNotifications] No user or unitId, skipping polling setup', {
        hasUserId: !!user?.id,
        userUnitId,
        userUnitIdType: typeof userUnitId
      });
      return;
    }

    // Initial fetch
    console.log('🔄 [useNotifications] Starting initial fetch and polling');
    fetchNotifications();

    // Start polling
    notificationService.startPolling(
      user.id,
      userUnitId,
      (notifs, count) => {
        console.log('📬 [useNotifications] Polling callback received:', {
          notificationCount: notifs.length,
          unreadCount: count,
          timestamp: new Date().toISOString()
        });
        setNotifications(notifs);
        setUnreadCount(count);
      }
    );

    // Cleanup
    return () => {
      console.log('🧹 [useNotifications] Cleanup: stopping polling');
      notificationService.stopPolling();
    };
  }, [user?.id, userUnitId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}
