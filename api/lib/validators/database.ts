import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Database validation result interface
 */
export interface DatabaseValidationResult {
  valid: boolean;
  data?: any;
  error?: string;
}

/**
 * Validate that a unit exists and is active
 * @param supabase - Supabase client
 * @param unitId - Unit ID to validate
 * @returns Validation result with unit data if valid
 */
export async function validateUnit(
  supabase: SupabaseClient,
  unitId: string
): Promise<DatabaseValidationResult> {
  try {
    const { data, error } = await supabase
      .from('units')
      .select('id, name, code, is_active')
      .eq('id', unitId)
      .single();
    
    if (error) {
      return {
        valid: false,
        error: `Unit tidak ditemukan: ${error.message}`
      };
    }
    
    if (!data) {
      return {
        valid: false,
        error: 'Unit tidak ditemukan'
      };
    }
    
    if (!data.is_active) {
      return {
        valid: false,
        error: 'Unit tidak aktif'
      };
    }
    
    return {
      valid: true,
      data
    };
  } catch (error: any) {
    return {
      valid: false,
      error: `Error validating unit: ${error.message}`
    };
  }
}

/**
 * Validate that a service category exists and is active
 * @param supabase - Supabase client
 * @param categoryId - Category ID to validate
 * @returns Validation result with category data if valid
 */
export async function validateCategory(
  supabase: SupabaseClient,
  categoryId: string
): Promise<DatabaseValidationResult> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('id, name, code, is_active')
      .eq('id', categoryId)
      .single();
    
    if (error) {
      return {
        valid: false,
        error: `Kategori tidak ditemukan: ${error.message}`
      };
    }
    
    if (!data) {
      return {
        valid: false,
        error: 'Kategori tidak ditemukan'
      };
    }
    
    if (!data.is_active) {
      return {
        valid: false,
        error: 'Kategori tidak aktif'
      };
    }
    
    return {
      valid: true,
      data
    };
  } catch (error: any) {
    return {
      valid: false,
      error: `Error validating category: ${error.message}`
    };
  }
}

/**
 * Validate that a QR code exists and is active
 * @param supabase - Supabase client
 * @param token - QR code token to validate
 * @returns Validation result with QR code data if valid
 */
export async function validateQRCode(
  supabase: SupabaseClient,
  token: string
): Promise<DatabaseValidationResult> {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('id, token, unit_id, is_active, usage_count')
      .eq('token', token)
      .single();
    
    if (error) {
      return {
        valid: false,
        error: `QR code tidak ditemukan: ${error.message}`
      };
    }
    
    if (!data) {
      return {
        valid: false,
        error: 'QR code tidak ditemukan'
      };
    }
    
    if (!data.is_active) {
      return {
        valid: false,
        error: 'QR code tidak aktif'
      };
    }
    
    return {
      valid: true,
      data
    };
  } catch (error: any) {
    return {
      valid: false,
      error: `Error validating QR code: ${error.message}`
    };
  }
}

/**
 * Find category by name or code (for backward compatibility)
 * @param supabase - Supabase client
 * @param nameOrCode - Category name or code
 * @returns Validation result with category data if found
 */
export async function findCategoryByNameOrCode(
  supabase: SupabaseClient,
  nameOrCode: string
): Promise<DatabaseValidationResult> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('id, name, code, is_active')
      .or(`name.ilike.%${nameOrCode}%,code.ilike.%${nameOrCode}%`)
      .eq('is_active', true)
      .limit(1);
    
    if (error) {
      return {
        valid: false,
        error: `Error searching category: ${error.message}`
      };
    }
    
    if (!data || data.length === 0) {
      return {
        valid: false,
        error: 'Kategori tidak ditemukan'
      };
    }
    
    return {
      valid: true,
      data: data[0]
    };
  } catch (error: any) {
    return {
      valid: false,
      error: `Error finding category: ${error.message}`
    };
  }
}
