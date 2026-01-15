/**
 * TypeScript Interfaces for Complaint Management System
 * Task 2.1: Create TypeScript interfaces for all entities
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum TicketType {
  INFORMATION = 'information',
  COMPLAINT = 'complaint',
  SUGGESTION = 'suggestion',
  SATISFACTION = 'satisfaction'
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TicketSource {
  WEB = 'web',
  QR_CODE = 'qr_code',
  MOBILE = 'mobile',
  EMAIL = 'email',
  PHONE = 'phone'
}

export enum UserRole {
  STAFF = 'staff',
  SUPERVISOR = 'supervisor',
  MANAGER = 'manager',
  DIRECTOR = 'director',
  ADMIN = 'admin'
}

export enum ResponseType {
  COMMENT = 'comment',
  STATUS_UPDATE = 'status_update',
  RESOLUTION = 'resolution',
  ESCALATION = 'escalation'
}

export enum EscalationType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  SLA_BREACH = 'sla_breach'
}

export enum NotificationType {
  TICKET_CREATED = 'ticket_created',
  TICKET_ASSIGNED = 'ticket_assigned',
  TICKET_ESCALATED = 'ticket_escalated',
  TICKET_RESOLVED = 'ticket_resolved',
  SLA_REMINDER = 'sla_reminder',
  SURVEY_REQUEST = 'survey_request'
}

export enum NotificationChannel {
  WEB = 'web',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SMS = 'sms'
}

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Unit {
  id: string;
  name: string;
  code: string;
  parent_unit_id: string | null;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  sla_hours: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ServiceCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  default_sla_hours: number;
  requires_attachment: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  admin_id?: string;
  employee_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  unit_id?: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  type: TicketType;
  category_id?: string;
  title: string;
  description: string;
  
  // Submitter information (for public tickets)
  submitter_name?: string;
  submitter_email?: string;
  submitter_phone?: string;
  submitter_address?: string;
  is_anonymous: boolean;
  
  // Assignment and routing
  unit_id: string;
  assigned_to?: string;
  created_by?: string;
  
  // Status and priority
  status: TicketStatus;
  priority: TicketPriority;
  urgency_level: number; // 1-5
  
  // AI Analysis
  ai_classification?: AIClassification;
  sentiment_score?: number;
  confidence_score?: number;
  
  // SLA Management
  sla_deadline?: Date;
  first_response_at?: Date;
  resolved_at?: Date;
  
  // Tracking
  source: TicketSource;
  qr_code_id?: string;
  ip_address?: string;
  user_agent?: string;
  
  created_at: Date;
  updated_at: Date;
}

export interface QRCode {
  id: string;
  unit_id: string;
  code: string;
  token: string;
  name: string;
  description?: string;
  is_active: boolean;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface TicketResponse {
  id: string;
  ticket_id: string;
  responder_id: string;
  message: string;
  is_internal: boolean;
  response_type: ResponseType;
  created_at: Date;
  updated_at: Date;
}

export interface TicketEscalation {
  id: string;
  ticket_id: string;
  from_user_id?: string;
  to_user_id?: string;
  from_role: UserRole;
  to_role: UserRole;
  reason: string;
  escalation_type: EscalationType;
  escalated_at: Date;
  created_at: Date;
}

export interface SatisfactionSurvey {
  id: string;
  ticket_id: string;
  overall_score: number; // 1-5
  response_time_score: number; // 1-5
  solution_quality_score: number; // 1-5
  staff_courtesy_score: number; // 1-5
  comments?: string;
  submitted_at: Date;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id?: string;
  ticket_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  is_read: boolean;
  sent_at?: Date;
  created_at: Date;
}

export interface AILog {
  id: string;
  ticket_id: string;
  operation: string;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  confidence_score?: number;
  processing_time_ms?: number;
  model_version?: string;
  created_at: Date;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by?: string;
  created_at: Date;
}

// ============================================================================
// AI CLASSIFICATION TYPES
// ============================================================================

export interface AIClassification {
  ticket_type: TicketType;
  service_category?: string;
  urgency_level: number;
  priority: TicketPriority;
  confidence_score: number;
  sentiment: SentimentAnalysis;
  keywords: string[];
  suggested_unit?: string;
  similar_tickets?: string[];
  requires_human_review: boolean;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: 'negative' | 'neutral' | 'positive';
  confidence: number;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreatePublicTicketRequest {
  type: TicketType;
  title: string;
  description: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_phone?: string;
  submitter_address?: string;
  is_anonymous: boolean;
  qr_token?: string;
  unit_id?: string;
  attachments?: File[];
}

export interface CreateInternalTicketRequest {
  type: TicketType;
  category_id?: string;
  title: string;
  description: string;
  unit_id: string;
  priority?: TicketPriority;
  assigned_to?: string;
  attachments?: File[];
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
  category_id?: string;
}

export interface CreateTicketResponseRequest {
  message: string;
  is_internal: boolean;
  response_type: ResponseType;
}

export interface EscalateTicketRequest {
  reason: string;
  to_user_id?: string;
  to_role?: UserRole;
}

export interface TicketFilterOptions {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  type?: TicketType[];
  unit_id?: string;
  assigned_to?: string;
  created_by?: string;
  date_from?: Date;
  date_to?: Date;
  search?: string;
}

export interface DashboardMetrics {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  escalated_tickets: number;
  sla_compliance_rate: number;
  average_resolution_time: number;
  satisfaction_score: number;
  tickets_by_type: Record<TicketType, number>;
  tickets_by_priority: Record<TicketPriority, number>;
  tickets_by_unit: Array<{ unit_id: string; unit_name: string; count: number }>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginationOptions {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
