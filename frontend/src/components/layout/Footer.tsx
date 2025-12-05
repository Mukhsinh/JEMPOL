import { Lightbulb, Phone, MapPin, User } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
              <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  JEMPOL
                </span>
                <span className="text-xs text-gray-400">Jembatan Pembayaran Online</span>
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
                    <p className="text-white font-bold text-lg">RSUD Bendan</p>
                    <p className="text-primary-400 text-sm">Kota Pekalongan</p>
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
                    <p className="text-white font-semibold">Mukhsin Hadi</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-gray-600/50 p-2 rounded-lg transition-all">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-all">
                    <Phone className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">WhatsApp</p>
                    <a href="tel:+6285726112001" className="text-white font-semibold hover:text-green-400 transition-colors">
                      +62 857 2611 2001
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-gray-600/50 p-2 rounded-lg transition-all">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                    <MapPin className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Lokasi</p>
                    <p className="text-white font-semibold">Pekalongan, Indonesia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} <span className="font-semibold text-white">JEMPOL</span> - Jembatan Pembayaran Online. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <span className="text-sm">Privacy Policy</span>
              </a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <span className="text-sm">Terms of Service</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
