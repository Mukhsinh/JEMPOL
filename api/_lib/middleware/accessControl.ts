import type { VercelRequest } from '@vercel/node';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Role yang memiliki akses global ke semua unit
 */
const GLOBAL_ACCESS_ROLES = ['superadmin', 'direktur', 'director'];

/**
 * Interface untuk user info dari request
 */
export interface UserInfo {
  id: string;
  role: string;
  unit_id?: string;
  email?: string;
}

/**
 * Extract user info dari request
 * Bisa dari header Authorization (JWT token) atau query parameter (development)
 * 
 * @param req - Vercel request object
 * @returns UserInfo object atau null jika tidak ada user info
 */
export function extractUserInfo(req: VercelRequest): UserInfo | null {
  // Try to extract from Authorization header (JWT token)
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Decode JWT token (tanpa verifikasi signature karena Supabase sudah handle)
      // Format JWT: header.payload.signature
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        
        // Extract user info dari payload
        // Supabase JWT payload structure:
        // { sub: user_id, role: user_role, user_metadata: {...}, ... }
        const userId = payload.sub;
        const userRole = payload.user_metadata?.role || payload.role;
        const unitId = payload.user_metadata?.unit_id;
        
        if (userId) {
          // Return dengan userId saja, role dan unit_id akan diambil dari database
          return {
            id: userId,
            role: userRole || '', // akan di-override dari database
            unit_id: unitId // akan di-override dari database
          };
        }
      }
    } catch (error) {
      console.error('❌ Error decoding JWT token:', error);
    }
  }
  
  // Fallback: ambil dari query parameter (development only)
  const userId = req.query.user_id as string;
  const userRole = req.query.user_role as string;
  const unitId = req.query.unit_id as string;
  
  if (userId && userRole) {
    return {
      id: userId,
      role: userRole,
      unit_id: unitId
    };
  }
  
  return null;
}

/**
 * Enrich user info dengan data dari database
 * Mengambil role dan unit_id dari tabel users atau admins
 * 
 * @param supabase - Supabase client
 * @param userInfo - User info dari extractUserInfo
 * @returns UserInfo yang sudah dilengkapi dengan data dari database
 */
export async function enrichUserInfo(
  supabase: SupabaseClient,
  userInfo: UserInfo | null
): Promise<UserInfo | null> {
  if (!userInfo || !userInfo.id) {
    return null;
  }
  
  try {
    // Coba ambil dari tabel users dulu
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, unit_id, email, admin_id')
      .eq('id', userInfo.id)
      .maybeSingle();
    
    if (!userError && userData) {
      console.log('✅ Found user in users table:', { id: userInfo.id, unit_id: userData.unit_id, admin_id: userData.admin_id });
      
      let email = userData.email;
      
      // Jika email tidak ada di tabel users, ambil dari auth.users
      if (!email) {
        console.log('⚠️ Email not in users table, fetching from auth.users');
        const { data: authEmail, error: emailError } = await supabase
          .rpc('get_auth_user_email', { user_id: userInfo.id });
        
        if (!emailError && authEmail) {
          email = authEmail;
          console.log('✅ Got email from auth.users:', email);
        } else {
          console.error('❌ Failed to get email from auth.users:', emailError);
        }
      }
      
      // Override role, unit_id, dan email dengan data dari database
      return {
        id: userInfo.id,
        role: userData.role || userInfo.role,
        unit_id: userData.unit_id || userInfo.unit_id,
        email: email
      };
    }
    
    console.log('⚠️ User not found in users table');
    return userInfo; // Return original userInfo jika tidak ditemukan
  } catch (error) {
    console.error('❌ Error enriching user info:', error);
    return userInfo;
  }
}

/**
 * Extract dan enrich user info dari request
 * Kombinasi extractUserInfo dan enrichUserInfo
 * 
 * @param req - Vercel request object
 * @param supabase - Supabase client
 * @returns UserInfo yang sudah lengkap dengan data dari database
 */
export async function getUserInfo(
  req: VercelRequest,
  supabase: SupabaseClient
): Promise<UserInfo | null> {
  const userInfo = extractUserInfo(req);
  if (!userInfo) {
    return null;
  }
  
  return await enrichUserInfo(supabase, userInfo);
}

/**
 * Check apakah user memiliki akses global
 * 
 * @param userRole - Role user
 * @returns true jika user memiliki akses global, false jika tidak
 */
export function hasGlobalAccess(userRole: string): boolean {
  return GLOBAL_ACCESS_ROLES.includes(userRole.toLowerCase());
}

/**
 * Apply unit filter ke Supabase query
 * Jika user memiliki global access, tidak ada filter
 * Jika tidak, filter berdasarkan unit_id user
 * 
 * @param query - Supabase query builder
 * @param userInfo - User info object
 * @param unitIdColumn - Nama kolom unit_id di tabel (default: 'unit_id')
 * @returns Query dengan filter unit yang sudah diterapkan
 */
export function applyUnitFilter(
  query: any,
  userInfo: UserInfo | null,
  unitIdColumn: string = 'unit_id'
): any {
  // Jika tidak ada user info, return query tanpa filter (untuk public endpoints)
  if (!userInfo) {
    return query;
  }
  
  // Jika user memiliki global access, tidak perlu filter
  if (hasGlobalAccess(userInfo.role)) {
    console.log('🌐 Global access granted for role:', userInfo.role);
    return query;
  }
  
  // Jika user tidak punya unit_id, return query yang tidak akan return data
  if (!userInfo.unit_id) {
    console.warn('⚠️ User has no unit_id, restricting access');
    return query.eq(unitIdColumn, '00000000-0000-0000-0000-000000000000'); // UUID yang tidak ada
  }
  
  // Apply filter unit_id saja
  // User hanya dapat melihat tiket yang ditujukan langsung ke unit mereka
  console.log('🔒 Applying unit filter:', userInfo.unit_id);
  return query.eq(unitIdColumn, userInfo.unit_id);
}

/**
 * Apply unit filter untuk eskalasi
 * User dapat melihat eskalasi di mana unit mereka adalah source ATAU target
 * 
 * @param query - Supabase query builder
 * @param userInfo - User info object
 * @returns Query dengan filter eskalasi yang sudah diterapkan
 */
export function applyEscalationUnitFilter(
  query: any,
  userInfo: UserInfo | null
): any {
  if (!userInfo) {
    return query;
  }
  
  if (hasGlobalAccess(userInfo.role)) {
    console.log('🌐 Global access granted for escalations');
    return query;
  }
  
  if (!userInfo.unit_id) {
    console.warn('⚠️ User has no unit_id, restricting escalation access');
    return query.eq('to_unit_id', '00000000-0000-0000-0000-000000000000');
  }
  
  // Filter: to_unit_id = user.unit_id
  // Note: Untuk ticket_escalations, kita hanya filter berdasarkan to_unit_id
  // karena eskalasi dikirim KE unit tertentu
  console.log('🔒 Applying escalation unit filter:', userInfo.unit_id);
  return query.eq('to_unit_id', userInfo.unit_id);
}

/**
 * Validate apakah user memiliki akses ke resource tertentu
 * Return true jika user boleh akses, false jika tidak
 * 
 * @param supabase - Supabase client
 * @param userInfo - User info object
 * @param resourceType - Tipe resource: 'ticket', 'escalation', 'report'
 * @param resourceId - ID resource yang akan diakses
 * @returns Object dengan hasAccess boolean dan error message jika ada
 */
export async function validateResourceAccess(
  supabase: SupabaseClient,
  userInfo: UserInfo | null,
  resourceType: 'ticket' | 'escalation' | 'report' | 'external_ticket',
  resourceId: string
): Promise<{ hasAccess: boolean; error?: string }> {
  console.log('🔐 validateResourceAccess called:', {
    resourceType,
    resourceId,
    userInfo: userInfo ? {
      id: userInfo.id,
      role: userInfo.role,
      unit_id: userInfo.unit_id
    } : null
  });

  if (!userInfo) {
    return { hasAccess: false, error: 'User not authenticated' };
  }
  
  // Global access selalu boleh
  if (hasGlobalAccess(userInfo.role)) {
    console.log('✅ Global access granted for role:', userInfo.role);
    return { hasAccess: true };
  }
  
  // Check berdasarkan resource type
  if (resourceType === 'ticket') {
    const { data, error } = await supabase
      .from('tickets')
      .select('unit_id')
      .eq('id', resourceId)
      .single();
    
    console.log('🎫 Ticket query result:', { data, error });
    
    if (error || !data) {
      return { hasAccess: false, error: 'Ticket not found' };
    }
    
    // User dapat akses jika:
    // 1. Tiket ditujukan langsung ke unit mereka
    if (data.unit_id === userInfo.unit_id) {
      console.log('✅ Access granted: ticket belongs to user unit');
      return { hasAccess: true };
    }
    
    console.log('🔍 Ticket unit_id:', data.unit_id, 'User unit_id:', userInfo.unit_id);
    
    // 2. Cek apakah unit user ada dalam eskalasi (query sederhana)
    const { data: allEscalationUnits, error: allEscalationError } = await supabase
      .from('ticket_escalation_units')
      .select('unit_id')
      .eq('ticket_id', resourceId)
      .eq('unit_id', userInfo.unit_id)
      .limit(1);
    
    console.log('🔍 Checking escalation units for user unit:', {
      ticket_id: resourceId,
      user_unit_id: userInfo.unit_id,
      found: allEscalationUnits?.length || 0,
      error: allEscalationError?.message
    });
    
    // Jika ditemukan, user punya akses
    if (!allEscalationError && allEscalationUnits && allEscalationUnits.length > 0) {
      console.log('✅ Access granted: user unit found in escalation units');
      return { hasAccess: true };
    }
    
    // 3. Fallback: Cek ticket_escalations (untuk backward compatibility)
    // Cek apakah user unit adalah to_unit_id
    const { data: escalationsByToUnit, error: escalationToError } = await supabase
      .from('ticket_escalations')
      .select('id')
      .eq('ticket_id', resourceId)
      .eq('to_unit_id', userInfo.unit_id)
      .limit(1);
    
    if (!escalationToError && escalationsByToUnit && escalationsByToUnit.length > 0) {
      console.log('✅ Access granted: ticket escalated to user unit (to_unit_id)');
      return { hasAccess: true };
    }
    
    // Cek apakah user unit ada di cc_unit_ids
    const { data: escalationsByCc, error: escalationCcError } = await supabase
      .from('ticket_escalations')
      .select('id, cc_unit_ids')
      .eq('ticket_id', resourceId);
    
    console.log('🔍 Checking ticket_escalations CC (fallback):', { 
      ticket_id: resourceId, 
      user_unit_id: userInfo.unit_id,
      found: escalationsByCc?.length || 0,
      error: escalationCcError?.message
    });
    
    if (!escalationCcError && escalationsByCc && escalationsByCc.length > 0) {
      // Cek apakah user unit ada di cc_unit_ids
      const hasEscalationAccess = escalationsByCc.some(esc => {
        const isInCC = esc.cc_unit_ids && Array.isArray(esc.cc_unit_ids) && 
                       esc.cc_unit_ids.includes(userInfo.unit_id);
        return isInCC;
      });
      
      if (hasEscalationAccess) {
        console.log('✅ Access granted: ticket escalated to user unit (cc_unit_ids)');
        return { hasAccess: true };
      }
    }
    
    console.log('❌ Access denied: ticket not accessible by user unit');
    return { hasAccess: false, error: 'Access denied: ticket belongs to different unit and not escalated to your unit' };
  }
  
  if (resourceType === 'external_ticket') {
    const { data, error } = await supabase
      .from('external_tickets')
      .select('unit_id')
      .eq('id', resourceId)
      .single();
    
    if (error || !data) {
      return { hasAccess: false, error: 'External ticket not found' };
    }
    
    if (data.unit_id !== userInfo.unit_id) {
      return { hasAccess: false, error: 'Access denied: external ticket belongs to different unit' };
    }
    
    return { hasAccess: true };
  }
  
  if (resourceType === 'escalation') {
    const { data, error } = await supabase
      .from('ticket_escalations')
      .select('to_unit_id')
      .eq('id', resourceId)
      .single();
    
    if (error || !data) {
      return { hasAccess: false, error: 'Escalation not found' };
    }
    
    // User dapat akses jika unit mereka adalah target eskalasi
    const hasAccess = data.to_unit_id === userInfo.unit_id;
    if (!hasAccess) {
      return { hasAccess: false, error: 'Access denied: escalation does not involve your unit' };
    }
    
    return { hasAccess: true };
  }
  
  return { hasAccess: false, error: 'Unknown resource type' };
}
