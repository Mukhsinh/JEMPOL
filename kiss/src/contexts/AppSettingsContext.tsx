import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AppSettings {
  app_name: string;
  app_footer: string;
  institution_name: string;
  institution_address: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  call_center_number: string;
  whatsapp_help_number: string;
  manager_name: string;
  manager_position: string;
  job_title: string;
  description: string;
}

interface AppSettingsContextType {
  settings: AppSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  app_name: 'Sistem Pengaduan',
  app_footer: '',
  institution_name: 'Rumah Sakit',
  institution_address: '',
  logo_url: '',
  contact_email: '',
  contact_phone: '',
  website: '',
  call_center_number: '',
  whatsapp_help_number: '',
  manager_name: '',
  manager_position: '',
  job_title: '',
  description: ''
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {}
});

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
};

interface AppSettingsProviderProps {
  children: ReactNode;
}

export const AppSettingsProvider: React.FC<AppSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Error fetching app settings:', error);
        return;
      }

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: { setting_key: string; setting_value: string }) => {
          map[item.setting_key] = item.setting_value || '';
        });

        setSettings({
          app_name: map.app_name || defaultSettings.app_name,
          app_footer: map.app_footer || defaultSettings.app_footer,
          institution_name: map.institution_name || defaultSettings.institution_name,
          institution_address: map.institution_address || map.address || defaultSettings.institution_address,
          logo_url: map.logo_url || map.institution_logo || defaultSettings.logo_url,
          contact_email: map.contact_email || defaultSettings.contact_email,
          contact_phone: map.contact_phone || defaultSettings.contact_phone,
          website: map.website || defaultSettings.website,
          call_center_number: map.call_center_number || defaultSettings.call_center_number,
          whatsapp_help_number: map.whatsapp_help_number || defaultSettings.whatsapp_help_number,
          manager_name: map.manager_name || defaultSettings.manager_name,
          manager_position: map.manager_position || defaultSettings.manager_position,
          job_title: map.job_title || defaultSettings.job_title,
          description: map.description || defaultSettings.description
        });
      }
    } catch (err) {
      console.error('Error in fetchSettings:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to changes in app_settings table
    const channel = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings'
        },
        () => {
          console.log('App settings changed, refreshing...');
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AppSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
