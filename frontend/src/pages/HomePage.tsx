import Layout from '../components/layout/Layout';
import Container from '../components/layout/Container';
import VisitorRegistrationForm from '../components/visitor/VisitorRegistrationForm';
import {
  Building2,
  CreditCard,
  Heart,
  FileText,
  Users,
  Shield,
  Zap,
  CheckCircle,
  Smartphone,
  Globe
} from 'lucide-react';

function HomePage() {
  return (
    <Layout>
      {/* Hero Section with Circular Menu */}
      <section id="home" className="relative bg-gradient-to-br from-blue-400 via-primary to-blue-700 py-20 md:py-32 overflow-hidden min-h-screen flex items-center">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96">
            <div className="w-full h-full bg-white rounded-full opacity-10"></div>
          </div>
          <div className="absolute bottom-10 right-10 w-96 h-96">
            <div className="w-full h-full bg-white rounded-full opacity-10"></div>
          </div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <Container>
          <div className="relative z-10">
            {/* Title Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                Selamat Datang di <span className="text-yellow-300">Rumah Sakit Kota</span>
              </h1>
              <div className="inline-block bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-2xl">
                <p className="text-xl md:text-2xl font-bold text-primary">
                  Layanan Kesehatan Terpadu & Modern
                </p>
              </div>
              <p className="text-lg md:text-xl text-white mt-4 max-w-3xl mx-auto drop-shadow-md">
                Solusi Digital untuk Pelayanan Medis, Administrasi, dan Fasilitas Terbaik
              </p>
            </div>

            {/* Circular Menu Layout */}
            <div className="relative max-w-5xl mx-auto px-4">
              {/* Center Logo */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <div className="bg-white p-6 rounded-full shadow-2xl border-8 border-blue-100 flex items-center justify-center w-32 h-32 md:w-48 md:h-48">
                    <span className="material-symbols-outlined text-primary text-6xl md:text-8xl">local_hospital</span>
                  </div>
                </div>
              </div>

              {/* Circular Menu Items */}
              <div className="relative w-full aspect-square max-w-[380px] sm:max-w-[480px] md:max-w-3xl mx-auto">
                {/* Top - Login (0 degrees) */}
                <a href="/login" className="absolute left-1/2 transform -translate-x-1/2" style={{ top: '0%' }}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-pink-500">
                    <Globe className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-pink-500 mb-1" />
                    <p className="text-[10px] sm:text-xs md:text-base font-bold text-pink-600">Login</p>
                  </div>
                </a>

                {/* Top Right - Medis (45 degrees) */}
                <a href="/#services" className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ top: '14.65%', left: '85.35%' }}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-blue-500">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-blue-600 mb-1" />
                    <p className="text-[9px] sm:text-xs md:text-base font-bold text-blue-700 text-center px-1 leading-tight">Layanan<br />Medis</p>
                  </div>
                </a>

                {/* Right - Fasilitas (90 degrees) */}
                <a href="/#services" className="absolute top-1/2 transform -translate-y-1/2" style={{ right: '0%' }}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-orange-500">
                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-orange-600 mb-1" />
                    <p className="text-[10px] sm:text-xs md:text-base font-bold text-orange-700 text-center px-1">Fasilitas</p>
                  </div>
                </a>

                {/* Bottom Right - Administrasi (135 degrees) */}
                <a href="/#services" className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ top: '85.35%', left: '85.35%' }}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-purple-500">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-purple-600 mb-1" />
                    <p className="text-[10px] sm:text-xs md:text-base font-bold text-purple-700 text-center px-1">Admin</p>
                  </div>
                </a>

                {/* Bottom - Registrasi (180 degrees) */}
                <a href="/#registration" className="absolute left-1/2 transform -translate-x-1/2" style={{ bottom: '0%' }}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-emerald-500">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-emerald-600 mb-1" />
                    <p className="text-[9px] sm:text-xs md:text-base font-bold text-emerald-700 text-center px-1 leading-tight">Registrasi<br />Pasien</p>
                  </div>
                </a>

                {/* Bottom Left - Penagihan (225 degrees) */}
                <a href="/#features" className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ top: '85.35%', left: '14.65%' }}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-teal-500">
                    <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-teal-600 mb-1" />
                    <p className="text-[9px] sm:text-xs md:text-base font-bold text-teal-700 text-center px-1 leading-tight">Penagihan</p>
                  </div>
                </a>

                {/* Left - Keamanan (270 degrees) */}
                <a href="/#features" className="absolute top-1/2 transform -translate-y-1/2" style={{ left: '0%' }}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-red-500">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-red-600 mb-1" />
                    <p className="text-[9px] sm:text-xs md:text-base font-bold text-red-700 text-center px-1 leading-tight">Keamanan</p>
                  </div>
                </a>

                {/* Top Left - TI (315 degrees) */}
                <a href="/#features" className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ top: '14.65%', left: '14.65%' }}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-yellow-500">
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-yellow-600 mb-1" />
                    <p className="text-[9px] sm:text-xs md:text-base font-bold text-yellow-700 text-center px-1 leading-tight">Sistem TI</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Keunggulan <span className="text-primary">Rumah Sakit Kota</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Solusi manajemen rumah sakit yang aman, cepat, dan terpercaya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-primary">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manajemen Billing</h3>
              <p className="text-gray-600">Sistem penagihan yang transparan dan terintegrasi secara real-time</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-blue-500">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Akses Digital</h3>
              <p className="text-gray-600">Akses data pasien dan laporan kapan saja melalui platform kami</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-purple-500">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Keamanan Data</h3>
              <p className="text-gray-600">Data medis pasien dilindungi dengan enkripsi tingkat tinggi sesuai standar</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-orange-500">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Efisiensi SLA</h3>
              <p className="text-gray-600">Pemantauan waktu respon layanan untuk memastikan kepuasan pasien</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Layanan <span className="text-primary">Kami</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Berbagai unit layanan untuk memenuhi kebutuhan operasional rumah sakit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-primary opacity-90"></div>
              <div className="relative p-8 text-white">
                <Heart className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Unit Medis</h3>
                <ul className="space-y-2 text-blue-50">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Konsultasi Dokter</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Rekam Medis Digital</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Rawat Jalan & Inap</li>
                </ul>
              </div>
            </div>

            {/* Service 2 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-90"></div>
              <div className="relative p-8 text-white">
                <Building2 className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Fasilitas</h3>
                <ul className="space-y-2 text-orange-50">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Pemeliharaan Gedung</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Manajemen Aset</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Kebersihan & Sanitasi</li>
                </ul>
              </div>
            </div>

            {/* Service 3 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-90"></div>
              <div className="relative p-8 text-white">
                <FileText className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Administrasi</h3>
                <ul className="space-y-2 text-purple-50">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Manajemen SDM</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Pengadaan Barang</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Pelaporan Keuangan</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Registration Section */}
      <section id="registration" className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center shadow-xl">
                <Users className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Registrasi <span className="text-primary">Pengunjung</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Daftarkan diri Anda untuk mendapatkan layanan terbaik kami
            </p>
          </div>
          <VisitorRegistrationForm />
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <Container>
          <div className="text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Siap Mengelola Rumah Sakit Kota?
            </h2>
            <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto mb-8">
              Gunakan platform CMS kami untuk efisiensi operasional dan pelayanan pasien yang lebih baik
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/#registration"
                className="px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Users className="inline-block w-6 h-6 mr-2" />
                Daftar Sekarang
              </a>
              <a
                href="/login"
                className="px-8 py-4 bg-blue-800 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl border-2 border-white transform hover:scale-105 transition-all"
              >
                <Globe className="inline-block w-6 h-6 mr-2" />
                Login Admin
              </a>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}

export default HomePage;
