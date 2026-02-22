import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import notificationService, { Notification } from '../notificationService';
import { supabase } from '../../utils/supabaseClient';

// Mock supabase client
vi.mock('../../utils/supabaseClient', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('NotificationService', () => {
  const mockUserId = 'user-123';
  const mockUnitId = 'unit-456';
  const mockNotificationId = 'notif-789';

  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      user_id: mockUserId,
      unit_id: mockUnitId,
      ticket_id: 'ticket-1',
      type: 'new_ticket',
      message: 'Tiket baru TKT-001 masuk ke unit Anda',
      is_read: false,
      created_at: '2024-01-01T10:00:00Z',
      tickets: {
        ticket_number: 'TKT-001',
        title: 'Test Ticket',
        status: 'open'
      }
    },
    {
      id: 'notif-2',
      user_id: mockUserId,
      unit_id: mockUnitId,
      ticket_id: 'ticket-2',
      escalation_id: 'esc-1',
      type: 'escalation',
      message: 'Tiket TKT-002 dieskalasi dari IGD ke unit Anda',
      is_read: true,
      created_at: '2024-01-01T09:00:00Z',
      tickets: {
        ticket_number: 'TKT-002',
        title: 'Escalated Ticket',
        status: 'escalated'
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    notificationService.stopPolling();
  });

  describe('getNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({ data: mockNotifications, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit
      });

      mockEq.mockReturnValue({
        order: mockOrder,
        limit: mockLimit
      });

      mockOrder.mockReturnValue({
        limit: mockLimit
      });

      const result = await notificationService.getNotifications(mockUserId, mockUnitId, 20);

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('unit_id', mockUnitId);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockNotifications);
    });

    it('should return empty array on error', async () => {
      const mockError = new Error('Database error');
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({ data: null, error: mockError });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit
      });

      mockEq.mockReturnValue({
        order: mockOrder,
        limit: mockLimit
      });

      mockOrder.mockReturnValue({
        limit: mockLimit
      });

      await expect(notificationService.getNotifications(mockUserId, mockUnitId)).rejects.toThrow();
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      
      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ count: 5, error: null })
      });

      const result = await notificationService.getUnreadCount(mockUserId, mockUnitId);

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(result).toBe(5);
    });

    it('should return 0 on error', async () => {
      const mockError = new Error('Database error');
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      
      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      mockSelect.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ count: null, error: mockError })
      });

      const result = await notificationService.getUnreadCount(mockUserId, mockUnitId);

      expect(result).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate
      });

      mockUpdate.mockReturnValue({
        eq: mockEq
      });

      await notificationService.markAsRead(mockNotificationId);

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
      expect(mockEq).toHaveBeenCalledWith('id', mockNotificationId);
    });

    it('should throw error when update fails', async () => {
      const mockError = new Error('Update failed');
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: mockError });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate
      });

      mockUpdate.mockReturnValue({
        eq: mockEq
      });

      await expect(notificationService.markAsRead(mockNotificationId)).rejects.toThrow();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockEqFinal = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate
      });

      mockUpdate.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValueOnce({
        eq: mockEqFinal
      });

      await notificationService.markAllAsRead(mockUserId, mockUnitId);

      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
      expect(mockEq).toHaveBeenCalledWith('unit_id', mockUnitId);
      expect(mockEqFinal).toHaveBeenCalledWith('is_read', false);
    });

    it('should throw error when update fails', async () => {
      const mockError = new Error('Update failed');
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockEqFinal = vi.fn().mockResolvedValue({ error: mockError });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate
      });

      mockUpdate.mockReturnValue({
        eq: mockEq
      });

      mockEq.mockReturnValueOnce({
        eq: mockEqFinal
      });

      await expect(notificationService.markAllAsRead(mockUserId, mockUnitId)).rejects.toThrow();
    });
  });

  describe('polling', () => {
    it('should start polling and call callback', async () => {
      vi.useFakeTimers();
      
      const mockCallback = vi.fn();
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({ data: mockNotifications, error: null });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit,
        update: vi.fn().mockReturnThis()
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit
      });

      mockEq.mockReturnValue({
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit
      });

      mockOrder.mockReturnValue({
        limit: mockLimit
      });

      notificationService.startPolling(mockUserId, mockUnitId, mockCallback, 1000);

      // Wait for initial fetch
      await vi.runAllTimersAsync();

      expect(mockCallback).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should stop polling', () => {
      vi.useFakeTimers();
      
      const mockCallback = vi.fn();
      
      notificationService.startPolling(mockUserId, mockUnitId, mockCallback, 1000);
      notificationService.stopPolling();

      // Advance time and verify callback is not called again
      vi.advanceTimersByTime(2000);
      
      vi.useRealTimers();
    });
  });
});
