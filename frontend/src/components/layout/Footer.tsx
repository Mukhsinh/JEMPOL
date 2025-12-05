import { Lightbulb, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Platform Inovasi
              </span>
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
                  Pendaftaran Pengunjung
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
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">info@platforminovasi.id</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">+62 812-3456-7890</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Platform Inovasi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
