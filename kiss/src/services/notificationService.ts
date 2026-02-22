import { supabase } from '../utils/supabaseClient';

export interface Notification {
  id: string;
  user_id: string;
  unit_id: string;
  ticket_id: string;
  escalation_id?: string;
  type: 'ticket_created' | 'ticket_assigned' | 'ticket_escalated' | 'ticket_resolved' | 'sla_reminder' | 'survey_request' | 'new_ticket' | 'escalation' | 'response' | 'status_change';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  // Joined data
  tickets?: {
    ticket_number: string;
    title: string;
    status: string;
  };
}

class NotificationService {
  private pollingInterval: NodeJS.Timeout | null = null;

  /**
   * Get notifications untuk user tertentu
   */
  async getNotifications(
    userId: string,
    unitId: string,
    limit: number = 20
  ): Promise<Notification[]> {
    try {
      console.log('🔔 [notificationService.getNotifications] Fetching notifications:', {
        userId,
        unitId,
        limit,
        userIdType: typeof userId,
        unitIdType: typeof unitId,
        timestamp: new Date().toISOString()
      });

      // Validasi input yang lebih ketat
      if (!unitId || !userId || unitId === 'undefined' || userId === 'undefined' || unitId === 'null' || userId === 'null') {
        console.warn('⚠️ [notificationService.getNotifications] Invalid unitId or userId, returning empty array', {
          userId,
          unitId,
          userIdType: typeof userId,
          unitIdType: typeof unitId
        });
        return [];
      }

      // DEBUG: Cek dulu total notifikasi untuk user ini
      const { count: totalCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      console.log('🔍 [notificationService.getNotifications] Total notifications for user:', {
        userId,
        totalCount,
        timestamp: new Date().toISOString()
      });

      // DEBUG: Cek notifikasi dengan unit_id
      const { count: unitCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('unit_id', unitId);

      console.log('🔍 [notificationService.getNotifications] Notifications for user+unit:', {
        userId,
        unitId,
        unitCount,
        timestamp: new Date().toISOString()
      });
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          tickets (
            ticket_number,
            title,
            status
          )
        `)
        .eq('unit_id', unitId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [notificationService.getNotifications] Error fetching notifications:', error);
        throw error;
      }

      console.log('✅ [notificationService.getNotifications] Found notifications:', {
        count: data?.length || 0,
        unreadCount: data?.filter((n: Notification) => !n.is_read).length || 0,
        unitId: unitId,
        userId: userId,
        notifications: data?.map((n: Notification) => ({
          id: n.id,
          type: n.type,
          is_read: n.is_read,
          ticket_number: n.tickets?.ticket_number,
          created_at: n.created_at
        }))
      });
      
      return data || [];
    } catch (error) {
      console.error('❌ [notificationService.getNotifications] Error:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string, unitId: string): Promise<number> {
    try {
      console.log('🔢 [notificationService.getUnreadCount] Fetching unread count:', { 
        userId, 
        unitId,
        userIdType: typeof userId,
        unitIdType: typeof unitId
      });

      // Validasi input yang lebih ketat
      if (!unitId || !userId || unitId === 'undefined' || userId === 'undefined' || unitId === 'null' || userId === 'null') {
        console.warn('⚠️ [notificationService.getUnreadCount] Invalid unitId or userId, returning 0');
        return 0;
      }
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('unit_id', unitId)
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ [notificationService.getUnreadCount] Error:', error);
        return 0;
      }

      console.log('✅ [notificationService.getUnreadCount] Unread count:', count || 0);
      return count || 0;
    } catch (error) {
      console.error('❌ [notificationService.getUnreadCount] Error:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      console.log('📖 [notificationService.markAsRead] Marking notification as read:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ [notificationService.markAsRead] Error:', error);
        throw error;
      }
      
      console.log('✅ [notificationService.markAsRead] Notification marked as read successfully');
    } catch (error) {
      console.error('❌ [notificationService.markAsRead] Error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read untuk user
   */
  async markAllAsRead(userId: string, unitId: string): Promise<void> {
    try {
      console.log('📖 [notificationService.markAllAsRead] Marking all notifications as read:', { userId, unitId });
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('unit_id', unitId)
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ [notificationService.markAllAsRead] Error:', error);
        throw error;
      }
      
      console.log('✅ [notificationService.markAllAsRead] All notifications marked as read successfully');
    } catch (error) {
      console.error('❌ [notificationService.markAllAsRead] Error:', error);
      throw error;
    }
  }

  /**
   * Start polling notifications
   */
  startPolling(
    userId: string,
    unitId: string,
    callback: (notifications: Notification[], unreadCount: number) => void,
    intervalMs: number = 30000 // 30 seconds
  ): void {
    console.log('🔄 [notificationService.startPolling] Starting notification polling:', {
      userId,
      unitId,
      intervalMs,
      timestamp: new Date().toISOString()
    });
    
    // Clear existing interval
    this.stopPolling();

    // Initial fetch
    this.fetchAndNotify(userId, unitId, callback);

    // Start polling
    this.pollingInterval = setInterval(() => {
      console.log('🔄 [notificationService.startPolling] Polling tick at', new Date().toISOString());
      this.fetchAndNotify(userId, unitId, callback);
    }, intervalMs);
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      console.log('⏹️ [notificationService.stopPolling] Stopping notification polling at', new Date().toISOString());
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Helper: Fetch and notify
   */
  private async fetchAndNotify(
    userId: string,
    unitId: string,
    callback: (notifications: Notification[], unreadCount: number) => void
  ): Promise<void> {
    try {
      console.log('🔄 [notificationService.fetchAndNotify] Fetching notifications and unread count');
      
      const [notifications, unreadCount] = await Promise.all([
        this.getNotifications(userId, unitId),
        this.getUnreadCount(userId, unitId)
      ]);

      console.log('✅ [notificationService.fetchAndNotify] Callback with:', {
        notificationCount: notifications.length,
        unreadCount
      });
      
      callback(notifications, unreadCount);
    } catch (error) {
      console.error('❌ [notificationService.fetchAndNotify] Error:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
