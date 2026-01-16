import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AppFooterSettings {
  app_name: string;
  app_footer: string;
  institution_name: string;
  institution_address: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string;
  website: string;
}

interface AppFooterProps {
  variant?: 'default' | 'minimal' | 'compact';
  className?: string;
  showLogo?: boolean;
  showLinks?: boolean;
}

const AppFooter: React.FC<AppFooterProps> = ({ 
  variant = 'default', 
  className = '',
  showLogo = true,
  showLinks = true
}) => {
  const [settings, setSettings] = useState<AppFooterSettings>({
    app_name: 'Sistem Pengaduan',
    app_footer: '',
    institution_name: '',
    institution_address: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    website: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'app_name', 'app_footer', 'institution_name', 'institution_address',
          'contact_email', 'contact_phone', 'logo_url', 'website'
        ]);

      if (error) throw error;

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: { setting_key: string; setting_value: string }) => {
          map[item.setting_key] = item.setting_value || '';
        });

        setSettings({
          app_name: map.app_name || 'Sistem Pengaduan',
          app_footer: map.app_footer || '',
          institution_name: map.institution_name || '',
          institution_address: map.institution_address || '',
          contact_email: map.contact_email || '',
          contact_phone: map.contact_phone || '',
          logo_url: map.logo_url || '',
          website: map.website || ''
        });
      }
    } catch (err) {
      console.error('Error fetching app settings for footer:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  
  const getFooterText = () => {
    if (settings.app_footer) {
      return settings.app_footer;
    }
    return `© ${currentYear} ${settings.institution_name || settings.app_name}. Hak Cipta Dilindungi.`;
  };

  // Minimal variant - just copyright text
  if (variant === 'minimal') {
    return (
      <footer className={`py-4 text-center ${className}`}>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {getFooterText()}
        </p>
      </footer>
    );
  }

  // Compact variant - with logo and basic info
  if (variant === 'compact') {
    return (
      <footer className={`bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {showLogo && settings.logo_url && (
            <img src={settings.logo_url} alt="Logo" className="h-8 w-auto" />
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            {getFooterText()}
          </p>
        </div>
      </footer>
    );
  }

  // Default variant - full footer with all info
  return (
    <footer className={`bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left side - Logo and Institution */}
          <div className="flex items-center gap-4">
            {showLogo && settings.logo_url && (
              <img src={settings.logo_url} alt="Logo" className="h-10 w-auto" />
            )}
            <div className="text-center md:text-left">
              {settings.institution_name && (
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {settings.institution_name}
                </p>
              )}
              {settings.institution_address && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {settings.institution_address}
                </p>
              )}
            </div>
          </div>

          {/* Center - Footer text */}
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {getFooterText()}
            </p>
          </div>

          {/* Right side - Links */}
          {showLinks && (
            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Syarat & Ketentuan
              </a>
              {settings.website && (
                <a 
                  href={settings.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Website
                </a>
              )}
            </div>
          )}
        </div>

        {/* Contact info row */}
        {(settings.contact_email || settings.contact_phone) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {settings.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                📧 {settings.contact_email}
              </a>
            )}
            {settings.contact_phone && (
              <a href={`tel:${settings.contact_phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                📞 {settings.contact_phone}
              </a>
            )}
          </div>
        )}
      </div>
    </footer>
  );
};

export default AppFooter;
