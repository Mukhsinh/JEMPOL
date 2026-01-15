/**
 * Ticket Model with Status Management
 * Task 2.5: Create Ticket model with status management
 */

import { supabase } from '../config/supabase';
import {
  Ticket,
  TicketType,
  TicketStatus,
  TicketPriority,
  TicketSource,
  CreatePublicTicketRequest,
  CreateInternalTicketRequest,
  UpdateTicketRequest
} from '../types/complaint-management';

/**
 * Ticket Lifecycle State Machine
 * Defines valid status transitions
 */
const VALID_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.ESCALATED, TicketStatus.RESOLVED, TicketStatus.OPEN],
  [TicketStatus.ESCALATED]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
  [TicketStatus.CLOSED]: [] // Terminal state
};

export class TicketModel {
  /**
   * Generate unique ticket number
   * Format: TKT-YYYYMMDD-XXXXX
   */
  static async generateTicketNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    // Get count of tickets created today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString());
    
    if (error) {
      throw new Error(`Failed to generate ticket number: ${error.message}`);
    }
    
    const sequence = String((count || 0) + 1).padStart(5, '0');
    return `TKT-${datePrefix}-${sequence}`;
  }

  /**
   * Calculate SLA deadline based on unit and category
   */
  static async calculateSLADeadline(unitId: string, categoryId?: string): Promise<Date> {
    let slaHours = 24; // Default
    
    // Get SLA from category first
    if (categoryId) {
      const { data: category } = await supabase
        .from('service_categories')
        .select('default_sla_hours')
        .eq('id', categoryId)
        .single();
      
      if (category?.default_sla_hours) {
        slaHours = category.default_sla_hours;
      }
    }
    
    // Override with unit SLA if available
    const { data: unit } = await supabase
      .from('units')
      .select('sla_hours')
      .eq('id', unitId)
      .single();
    
    if (unit?.sla_hours) {
      slaHours = unit.sla_hours;
    }
    
    // Calculate deadline (excluding weekends and holidays - simplified version)
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + slaHours);
    
    return deadline;
  }

  /**
   * Validate status transition
   */
  static isValidStatusTransition(currentStatus: TicketStatus, newStatus: TicketStatus): boolean {
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    return validTransitions.includes(newStatus);
  }

  /**
   * Create public ticket
   */
  static async createPublicTicket(data: CreatePublicTicketRequest, ipAddress?: string, userAgent?: string): Promise<Ticket> {
    // Generate ticket number
    const ticketNumber = await this.generateTicketNumber();
    
    // Determine unit_id from QR token if provided
    let unitId = data.unit_id;
    let qrCodeId: string | undefined;
    
    if (data.qr_token) {
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, unit_id')
        .eq('token', data.qr_token)
        .eq('is_active', true)
        .single();
      
      if (qrError || !qrCode) {
        throw new Error('Invalid or inactive QR code');
      }
      
      unitId = qrCode.unit_id;
      qrCodeId = qrCode.id;
      
      // Increment usage count
      await supabase
        .from('qr_codes')
        .update({ usage_count: supabase.rpc('increment', { row_id: qrCode.id }) })
        .eq('id', qrCode.id);
    }
    
    if (!unitId) {
      throw new Error('Unit ID is required');
    }
    
    // Calculate SLA deadline
    const slaDeadline = await this.calculateSLADeadline(unitId);
    
    // Create ticket
    const ticketData = {
      ticket_number: ticketNumber,
      type: data.type,
      title: data.title,
      description: data.description,
      submitter_name: data.submitter_name,
      submitter_email: data.submitter_email,
      submitter_phone: data.submitter_phone,
      submitter_address: data.submitter_address,
      is_anonymous: data.is_anonymous,
      unit_id: unitId,
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      urgency_level: 3,
      source: data.qr_token ? TicketSource.QR_CODE : TicketSource.WEB,
      qr_code_id: qrCodeId,
      sla_deadline: slaDeadline.toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent
    };
    
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create ticket: ${error.message}`);
    }
    
    return ticket as Ticket;
  }

  /**
   * Create internal ticket
   */
  static async createInternalTicket(data: CreateInternalTicketRequest, createdBy: string): Promise<Ticket> {
    // Generate ticket number
    const ticketNumber = await this.generateTicketNumber();
    
    // Calculate SLA deadline
    const slaDeadline = await this.calculateSLADeadline(data.unit_id, data.category_id);
    
    // Create ticket
    const ticketData = {
      ticket_number: ticketNumber,
      type: data.type,
      category_id: data.category_id,
      title: data.title,
      description: data.description,
      unit_id: data.unit_id,
      assigned_to: data.assigned_to,
      created_by: createdBy,
      status: TicketStatus.OPEN,
      priority: data.priority || TicketPriority.MEDIUM,
      urgency_level: 3,
      source: TicketSource.WEB,
      sla_deadline: slaDeadline.toISOString()
    };
    
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create ticket: ${error.message}`);
    }
    
    return ticket as Ticket;
  }

  /**
   * Update ticket status with validation
   */
  static async updateTicketStatus(ticketId: string, newStatus: TicketStatus, userId: string): Promise<Ticket> {
    // Get current ticket
    const { data: currentTicket, error: fetchError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();
    
    if (fetchError || !currentTicket) {
      throw new Error('Ticket not found');
    }
    
    // Validate status transition
    if (!this.isValidStatusTransition(currentTicket.status, newStatus)) {
      throw new Error(`Invalid status transition from ${currentTicket.status} to ${newStatus}`);
    }
    
    // Update ticket
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // Set timestamps based on status
    if (newStatus === TicketStatus.IN_PROGRESS && !currentTicket.first_response_at) {
      updateData.first_response_at = new Date().toISOString();
    }
    
    if (newStatus === TicketStatus.RESOLVED && !currentTicket.resolved_at) {
      updateData.resolved_at = new Date().toISOString();
    }
    
    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Failed to update ticket: ${updateError.message}`);
    }
    
    return updatedTicket as Ticket;
  }

  /**
   * Update ticket
   */
  static async updateTicket(ticketId: string, data: UpdateTicketRequest, userId: string): Promise<Ticket> {
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    // If status is being updated, validate transition
    if (data.status) {
      const { data: currentTicket } = await supabase
        .from('tickets')
        .select('status')
        .eq('id', ticketId)
        .single();
      
      if (currentTicket && !this.isValidStatusTransition(currentTicket.status, data.status)) {
        throw new Error(`Invalid status transition from ${currentTicket.status} to ${data.status}`);
      }
    }
    
    const { data: updatedTicket, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update ticket: ${error.message}`);
    }
    
    return updatedTicket as Ticket;
  }

  /**
   * Get ticket by ID
   */
  static async getById(ticketId: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();
    
    if (error) {
      return null;
    }
    
    return data as Ticket;
  }

  /**
   * Get ticket by ticket number
   */
  static async getByTicketNumber(ticketNumber: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_number', ticketNumber)
      .single();
    
    if (error) {
      return null;
    }
    
    return data as Ticket;
  }

  /**
   * Check if ticket is overdue
   */
  static isOverdue(ticket: Ticket): boolean {
    if (!ticket.sla_deadline || ticket.status === TicketStatus.CLOSED) {
      return false;
    }
    
    return new Date(ticket.sla_deadline) < new Date();
  }

  /**
   * Get tickets approaching SLA deadline
   */
  static async getTicketsApproachingSLA(hoursBeforeDeadline: number = 2): Promise<Ticket[]> {
    const now = new Date();
    const threshold = new Date(now.getTime() + hoursBeforeDeadline * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .not('status', 'in', `(${TicketStatus.RESOLVED},${TicketStatus.CLOSED})`)
      .lte('sla_deadline', threshold.toISOString())
      .gte('sla_deadline', now.toISOString());
    
    if (error) {
      throw new Error(`Failed to fetch tickets: ${error.message}`);
    }
    
    return data as Ticket[];
  }

  /**
   * Get overdue tickets
   */
  static async getOverdueTickets(): Promise<Ticket[]> {
    const now = new Date();
    
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .not('status', 'in', `(${TicketStatus.RESOLVED},${TicketStatus.CLOSED})`)
      .lt('sla_deadline', now.toISOString());
    
    if (error) {
      throw new Error(`Failed to fetch tickets: ${error.message}`);
    }
    
    return data as Ticket[];
  }
}
