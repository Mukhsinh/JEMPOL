/**
 * Zod Validation Schemas for Complaint Management System
 * Task 2.1: Implement validation schemas using Zod
 */

import { z } from 'zod';
import {
  TicketType,
  TicketStatus,
  TicketPriority,
  TicketSource,
  UserRole,
  ResponseType,
  EscalationType,
  NotificationType,
  NotificationChannel
} from './complaint-management';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const TicketTypeSchema = z.nativeEnum(TicketType);
export const TicketStatusSchema = z.nativeEnum(TicketStatus);
export const TicketPrioritySchema = z.nativeEnum(TicketPriority);
export const TicketSourceSchema = z.nativeEnum(TicketSource);
export const UserRoleSchema = z.nativeEnum(UserRole);
export const ResponseTypeSchema = z.nativeEnum(ResponseType);
export const EscalationTypeSchema = z.nativeEnum(EscalationType);
export const NotificationTypeSchema = z.nativeEnum(NotificationType);
export const NotificationChannelSchema = z.nativeEnum(NotificationChannel);

// ============================================================================
// CORE ENTITY SCHEMAS
// ============================================================================

export const UnitSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/),
  parent_unit_id: z.string().uuid().nullable().optional(),
  description: z.string().max(1000).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().min(10).max(50).optional(),
  sla_hours: z.number().int().min(1).max(168).default(24),
  is_active: z.boolean().default(true)
});

export const ServiceCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/),
  description: z.string().max(1000).optional(),
  default_sla_hours: z.number().int().min(1).max(168).default(24),
  requires_attachment: z.boolean().default(false),
  is_active: z.boolean().default(true)
});

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  admin_id: z.string().uuid().optional(),
  employee_id: z.string().max(50).optional(),
  full_name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().min(10).max(50).optional(),
  unit_id: z.string().uuid().optional(),
  role: UserRoleSchema,
  is_active: z.boolean().default(true)
});

export const TicketSchema = z.object({
  id: z.string().uuid().optional(),
  ticket_number: z.string().max(50).optional(),
  type: TicketTypeSchema,
  category_id: z.string().uuid().optional(),
  title: z.string().min(10).max(500),
  description: z.string().min(20),
  
  // Submitter information
  submitter_name: z.string().max(255).optional(),
  submitter_email: z.string().email().optional(),
  submitter_phone: z.string().min(10).max(50).optional(),
  submitter_address: z.string().max(500).optional(),
  is_anonymous: z.boolean().default(false),
  
  // Assignment
  unit_id: z.string().uuid(),
  assigned_to: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
  
  // Status
  status: TicketStatusSchema.default(TicketStatus.OPEN),
  priority: TicketPrioritySchema.default(TicketPriority.MEDIUM),
  urgency_level: z.number().int().min(1).max(5).default(3),
  
  // AI Analysis
  ai_classification: z.any().optional(),
  sentiment_score: z.number().min(-1).max(1).optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  
  // SLA
  sla_deadline: z.date().optional(),
  first_response_at: z.date().optional(),
  resolved_at: z.date().optional(),
  
  // Tracking
  source: TicketSourceSchema.default(TicketSource.WEB),
  qr_code_id: z.string().uuid().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional()
});

export const QRCodeSchema = z.object({
  id: z.string().uuid().optional(),
  unit_id: z.string().uuid(),
  code: z.string().min(1).max(255),
  token: z.string().min(1).max(500),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  is_active: z.boolean().default(true),
  usage_count: z.number().int().min(0).default(0)
});

export const TicketResponseSchema = z.object({
  id: z.string().uuid().optional(),
  ticket_id: z.string().uuid(),
  responder_id: z.string().uuid(),
  message: z.string().min(1),
  is_internal: z.boolean().default(false),
  response_type: ResponseTypeSchema.default(ResponseType.COMMENT)
});

export const TicketEscalationSchema = z.object({
  id: z.string().uuid().optional(),
  ticket_id: z.string().uuid(),
  from_user_id: z.string().uuid().optional(),
  to_user_id: z.string().uuid().optional(),
  from_role: UserRoleSchema,
  to_role: UserRoleSchema,
  reason: z.string().min(10),
  escalation_type: EscalationTypeSchema.default(EscalationType.MANUAL)
});

export const SatisfactionSurveySchema = z.object({
  id: z.string().uuid().optional(),
  ticket_id: z.string().uuid(),
  overall_score: z.number().int().min(1).max(5),
  response_time_score: z.number().int().min(1).max(5),
  solution_quality_score: z.number().int().min(1).max(5),
  staff_courtesy_score: z.number().int().min(1).max(5),
  comments: z.string().max(2000).optional()
});

export const NotificationSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  ticket_id: z.string().uuid().optional(),
  type: NotificationTypeSchema,
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  channels: z.array(NotificationChannelSchema).default([NotificationChannel.WEB]),
  is_read: z.boolean().default(false)
});

export const TicketAttachmentSchema = z.object({
  id: z.string().uuid().optional(),
  ticket_id: z.string().uuid(),
  file_name: z.string().min(1).max(255),
  file_path: z.string().min(1),
  file_size: z.number().int().min(0),
  mime_type: z.string().min(1).max(100),
  uploaded_by: z.string().uuid().optional()
});

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

export const CreatePublicTicketSchema = z.object({
  type: TicketTypeSchema,
  title: z.string().min(10).max(500),
  description: z.string().min(20),
  submitter_name: z.string().max(255).optional(),
  submitter_email: z.string().email().optional(),
  submitter_phone: z.string().min(10).max(50).optional(),
  submitter_address: z.string().max(500).optional(),
  is_anonymous: z.boolean().default(false),
  qr_token: z.string().optional(),
  unit_id: z.string().uuid().optional()
}).refine(
  (data) => {
    // If not anonymous, at least one contact method is required
    if (!data.is_anonymous) {
      return !!(data.submitter_name || data.submitter_email || data.submitter_phone);
    }
    return true;
  },
  {
    message: 'At least one contact method is required for non-anonymous tickets'
  }
);

export const CreateInternalTicketSchema = z.object({
  type: TicketTypeSchema,
  category_id: z.string().uuid().optional(),
  title: z.string().min(10).max(500),
  description: z.string().min(20),
  unit_id: z.string().uuid(),
  priority: TicketPrioritySchema.optional(),
  assigned_to: z.string().uuid().optional()
});

export const UpdateTicketSchema = z.object({
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
  assigned_to: z.string().uuid().optional(),
  category_id: z.string().uuid().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update'
  }
);

export const CreateTicketResponseSchema = z.object({
  message: z.string().min(1),
  is_internal: z.boolean().default(false),
  response_type: ResponseTypeSchema.default(ResponseType.COMMENT)
});

export const EscalateTicketSchema = z.object({
  reason: z.string().min(10),
  to_user_id: z.string().uuid().optional(),
  to_role: UserRoleSchema.optional()
}).refine(
  (data) => !!(data.to_user_id || data.to_role),
  {
    message: 'Either to_user_id or to_role must be provided'
  }
);

export const TicketFilterSchema = z.object({
  status: z.array(TicketStatusSchema).optional(),
  priority: z.array(TicketPrioritySchema).optional(),
  type: z.array(TicketTypeSchema).optional(),
  unit_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  search: z.string().optional()
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate data against a schema and return typed result
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Format Zod errors for API responses
 */
export function formatValidationErrors(errors: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(error.message);
  });
  
  return formatted;
}
