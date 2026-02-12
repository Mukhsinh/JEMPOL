import { supabase } from '../utils/supabaseClient';

export interface AppSettings {
  app_name: string;
  institution_name: string;
  logo_url: string;
  app_footer: string;
  call_center_number: string;
  whatsapp_help_number: string;
  contact_phone: string;
  contact_email: string;
  institution_address: string;
  website: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  app_name: 'KISS',
  institution_name: 'RSUD Bendan',
  logo_url: '',
  app_footer: '© 2025 KISS. Hak Cipta dilindungi oleh Undang-Undang',
  call_center_number: '112',
  whatsapp_help_number: '',
  contact_phone: '',
  contact_email: '',
  institution_address: '',
  website: ''
};

export async function getAppSettings(): Promise<AppSettings> {
  try {
    // Coba ambil dari API endpoint jika tersedia
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/public/app-settings`);
      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          ...DEFAULT_SETTINGS,
          ...data.data
        };
      }
    }
    
    // Fallback: ambil langsung dari Supabase
    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .eq('is_public', true);

    if (error) {
      console.error('Error fetching app settings from Supabase:', error);
      return DEFAULT_SETTINGS;
    }

    // Convert array to object
    const settingsObject: any = {};
    if (settings && settings.length > 0) {
      settings.forEach((item: any) => {
        settingsObject[item.setting_key] = item.setting_value;
      });
    }

    return {
      ...DEFAULT_SETTINGS,
      ...settingsObject
    };
  } catch (error) {
    console.error('Error in getAppSettings:', error);
    return DEFAULT_SETTINGS;
  }
}
