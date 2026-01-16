import { useState, useEffect } from 'react';
import { Lightbulb, Phone, MapPin, User, Mail, Globe } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

interface AppSettings {
  app_name: string;
  app_footer: string;
  institution_name: string;
  institution_address: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string;
  website: string;
  manager_name: string;
}

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<AppSettings>({
    app_name: 'JEMPOL',
    app_footer: '',
    institution_name: 'RSUD Bendan',
    institution_address: 'Kota Pekalongan',
    contact_email: '',
    contact_phone: '+62 857 2611 2001',
    logo_url: '',
    website: '',
    manager_name: 'Mukhsin Hadi'
  });

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
          'contact_email', 'contact_phone', 'logo_url', 'website', 'manager_name'
        ]);

      if (error) throw error;

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((item: { setting_key: string; setting_value: string }) => {
          map[item.setting_key] = item.setting_value || '';
        });

        setSettings(prev => ({
          app_name: map.app_name || prev.app_name,
          app_footer: map.app_footer || prev.app_footer,
          institution_name: map.institution_name || prev.institution_name,
          institution_address: map.institution_address || prev.institution_address,
          contact_email: map.contact_email || prev.contact_email,
          contact_phone: map.contact_phone || prev.contact_phone,
          logo_url: map.logo_url || prev.logo_url,
          website: map.website || prev.website,
          manager_name: map.manager_name || prev.manager_name
        }));
      }
    } catch (err) {
      console.error('Error fetching app settings:', err);
    }
  };

  const getFooterText = () => {
    if (settings.app_footer) {
      return settings.app_footer;
    }
    return `© ${currentYear} ${settings.app_name}. Hak Cipta Dilindungi.`;
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container-custom py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  {settings.app_name}
                </span>
                <span className="text-xs text-gray-400">{settings.institution_name}</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Platform untuk menampilkan inovasi, mendaftar pengunjung, dan bermain game interaktif.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <a href="/#registration" className="text-sm hover:text-primary-400 transition-colors">
                  Daftar Pengunjung
                </a>
              </li>
              <li>
                <a href="/#gallery" className="text-sm hover:text-primary-400 transition-colors">
                  Galeri Inovasi
                </a>
              </li>
              <li>
                <a href="/game" className="text-sm hover:text-primary-400 transition-colors">
                  Game Interaktif
                </a>
              </li>
              <li>
                <a href="/#leaderboard" className="text-sm hover:text-primary-400 transition-colors">
                  Leaderboard
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mr-2">
                <Phone className="w-4 h-4 text-white" />
              </span>
              Kontak
            </h3>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-5 border border-gray-600 shadow-xl">
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🏥</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{settings.institution_name}</p>
                    <p className="text-primary-400 text-sm">{settings.institution_address}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 border-t border-gray-600 pt-3">
                <div className="flex items-center space-x-3 group hover:bg-gray-600/50 p-2 rounded-lg transition-all">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center group-hover:bg-primary-500/30 transition-all">
                    <User className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Kontak Person</p>
                    <p className="text-white font-semibold">{settings.manager_name}</p>
                  </div>
                </div>
                {settings.contact_phone && (
                  <div className="flex items-center space-x-3 group hover:bg-gray-600/50 p-2 rounded-lg transition-all">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-all">
                      <Phone className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">WhatsApp</p>
                      <a href={`tel:${settings.contact_phone}`} className="text-white font-semibold hover:text-green-400 transition-colors">
                        {settings.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
                {settings.contact_email && (
                  <div className="flex items-center space-x-3 group hover:bg-gray-600/50 p-2 rounded-lg transition-all">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <a href={`mailto:${settings.contact_email}`} className="text-white font-semibold hover:text-blue-400 transition-colors">
                        {settings.contact_email}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3 group hover:bg-gray-600/50 p-2 rounded-lg transition-all">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                    <MapPin className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Lokasi</p>
                    <p className="text-white font-semibold">{settings.institution_address || 'Indonesia'}</p>
                  </div>
                </div>
                {settings.website && (
                  <div className="flex items-center space-x-3 group hover:bg-gray-600/50 p-2 rounded-lg transition-all">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-all">
                      <Globe className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Website</p>
                      <a href={settings.website} target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-purple-400 transition-colors">
                        {settings.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              {getFooterText()}
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <span className="text-sm">Kebijakan Privasi</span>
              </a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <span className="text-sm">Syarat & Ketentuan</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
