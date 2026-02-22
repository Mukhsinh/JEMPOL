import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface untuk audit log entry
 */
export interface AuditLogEntry {
  user_id: string;
  user_role: string;
  action: string; // 'view', 'create', 'update', 'delete'
  resource_type: string; // 'ticket', 'escalation', 'report', 'external_ticket'
  resource_id?: string;
  unit_id?: string;
  unauthorized_attempt: boolean;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
}

/**
 * Log akses user ke resource
 * 
 * @param supabase - Supabase client
 * @param entry - Audit log entry object
 */
export async function logAccess(
  supabase: SupabaseClient,
  entry: AuditLogEntry
): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: entry.user_id,
        user_role: entry.user_role,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        unit_id: entry.unit_id,
        unauthorized_attempt: entry.unauthorized_attempt,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
        metadata: entry.metadata,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('❌ Failed to log audit entry:', error);
    } else {
      console.log('✅ Audit log created:', {
        user: entry.user_id,
        action: entry.action,
        resource: entry.resource_type,
        unauthorized: entry.unauthorized_attempt
      });
    }
  } catch (error) {
    // Silent fail - jangan block operasi utama
    console.error('❌ Audit log error:', error);
  }
}

/**
 * Log unauthorized access attempt
 * 
 * @param supabase - Supabase client
 * @param userId - ID user yang mencoba akses
 * @param userRole - Role user
 * @param resourceType - Tipe resource yang dicoba diakses
 * @param resourceId - ID resource yang dicoba diakses
 * @param requestInfo - Informasi request (IP, user agent)
 */
export async function logUnauthorizedAttempt(
  supabase: SupabaseClient,
  userId: string,
  userRole: string,
  resourceType: string,
  resourceId: string,
  requestInfo: { ip?: string; userAgent?: string }
): Promise<void> {
  await logAccess(supabase, {
    user_id: userId,
    user_role: userRole,
    action: 'view',
    resource_type: resourceType,
    resource_id: resourceId,
    unauthorized_attempt: true,
    ip_address: requestInfo.ip,
    user_agent: requestInfo.userAgent
  });
}

/**
 * Log successful access
 * 
 * @param supabase - Supabase client
 * @param userId - ID user yang mengakses
 * @param userRole - Role user
 * @param action - Action yang dilakukan
 * @param resourceType - Tipe resource yang diakses
 * @param resourceId - ID resource yang diakses
 * @param unitId - Unit ID yang terkait
 * @param requestInfo - Informasi request (IP, user agent)
 */
export async function logSuccessfulAccess(
  supabase: SupabaseClient,
  userId: string,
  userRole: string,
  action: string,
  resourceType: string,
  resourceId: string,
  unitId?: string,
  requestInfo?: { ip?: string; userAgent?: string }
): Promise<void> {
  await logAccess(supabase, {
    user_id: userId,
    user_role: userRole,
    action: action,
    resource_type: resourceType,
    resource_id: resourceId,
    unit_id: unitId,
    unauthorized_attempt: false,
    ip_address: requestInfo?.ip,
    user_agent: requestInfo?.userAgent
  });
}
