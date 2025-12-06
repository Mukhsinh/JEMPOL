import { useState } from 'react';
import Layout from '../components/layout/Layout';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import VisitorRegistrationForm from '../components/visitor/VisitorRegistrationForm';
import InnovationGallery from '../components/innovation/InnovationGallery';
import InnovationViewer from '../components/innovation/InnovationViewer';
import JempolHospitalLogo from '../components/ui/JempolHospitalLogo';
import { InnovationItem } from '../types';
import { 
  Building2, 
  CreditCard, 
  Heart, 
  Activity, 
  FileText, 
  Users, 
  Shield, 
  Zap,
  CheckCircle,
  Clock,
  Smartphone,
  Globe
} from 'lucide-react';

function HomePage() {
  const [selectedInnovation, setSelectedInnovation] = useState<InnovationItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleInnovationClick = (item: InnovationItem) => {
    setSelectedInnovation(item);
    setIsViewerOpen(true);
  };

  return (
    <Layout>
      {/* Hero Section with Circular Menu */}
      <section id="home" className="relative bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 py-20 md:py-32 overflow-hidden min-h-screen flex items-center">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {/* Indonesia Map Pattern */}
          <div className="absolute top-10 left-10 w-96 h-96">
            <div className="w-full h-full bg-white rounded-full opacity-10"></div>
          </div>
          <div className="absolute bottom-10 right-10 w-96 h-96">
            <div className="w-full h-full bg-white rounded-full opacity-10"></div>
          </div>
          {/* Dotted pattern */}
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
                Selamat Datang di <span className="text-yellow-300">JEMPOL</span>
              </h1>
              <div className="inline-block bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-2xl">
                <p className="text-xl md:text-2xl font-bold text-emerald-700">
                  Platform Digital Pembayaran Rumah Sakit Terpadu
                </p>
              </div>
              <p className="text-lg md:text-xl text-white mt-4 max-w-3xl mx-auto drop-shadow-md">
                Jembatan Pembayaran Online untuk Klinik, Laboratorium & Radiologi
              </p>
            </div>

            {/* Circular Menu Layout */}
            <div className="relative max-w-5xl mx-auto">
              {/* Center Logo */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <JempolHospitalLogo size={192} className="drop-shadow-2xl" />
                </div>
              </div>

              {/* Circular Menu Items */}
              <div className="relative w-full aspect-square max-w-3xl mx-auto">
                {/* Top - Login */}
                <a href="/login" className="absolute top-0 left-1/2 transform -translate-x-1/2 group">
                  <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-pink-500">
                    <Globe className="w-10 h-10 md:w-12 md:h-12 text-pink-500 mb-2" />
                    <p className="text-sm md:text-base font-bold text-pink-600">Login</p>
                  </div>
                </a>

                {/* Top Right - Pembayaran Klinik */}
                <a href="/#services" className="absolute top-16 right-8 md:right-16 group">
                  <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-emerald-500">
                    <Heart className="w-10 h-10 md:w-12 md:h-12 text-emerald-600 mb-2" />
                    <p className="text-sm md:text-base font-bold text-emerald-700 text-center px-2">Pembayaran<br/>Klinik</p>
                  </div>
                </a>

                {/* Right - Laboratorium */}
                <a href="/#services" className="absolute top-1/2 right-0 transform -translate-y-1/2 group">
                  <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-blue-500">
                    <Activity className="w-10 h-10 md:w-12 md:h-12 text-blue-600 mb-2" />
                    <p className="text-sm md:text-base font-bold text-blue-700 text-center px-2">Laboratorium</p>
                  </div>
                </a>

                {/* Bottom Right - Radiologi */}
                <a href="/#services" className="absolute bottom-16 right-8 md:right-16 group">
                  <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-purple-500">
                    <FileText className="w-10 h-10 md:w-12 md:h-12 text-purple-600 mb-2" />
                    <p className="text-sm md:text-base font-bold text-purple-700 text-center px-2">Radiologi</p>
                  </div>
                </a>

                {/* Bottom - Registrasi */}
                <a href="/#registration" className="absolute bottom-0 left-1/2 transform -translate-x-1/2 group">
                  <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-orange-500">
                    <Users className="w-10 h-10 md:w-12 md:h-12 text-orange-600 mb-2" />
                    <p className="text-sm md:text-base font-bold text-orange-700 text-center px-2">Registrasi<br/>Pasien</p>
                  </div>
                </a>

                {/* Bottom Left - Riwayat */}
                <a href="/#features" className="absolute bottom-16 left-8 md:left-16 group">
                  <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-teal-500">
                    <Clock className="w-10 h-10 md:w-12 md:h-12 text-teal-600 mb-2" />
                    <p className="text-sm md:text-base font-bold text-teal-700 text-center px-2">Riwayat<br/>Transaksi</p>
                  </div>
                </a>

                {/* Left - Keamanan */}
                <a href="/#features" className="absolute top-1/2 left-0 transform -translate-y-1/2 group">
                  <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-red-500">
                    <Shield className="w-10 h-10 md:w-12 md:h-12 text-red-600 mb-2" />
                    <p className="text-sm md:text-base font-bold text-red-700 text-center px-2">Keamanan<br/>Data</p>
                  </div>
                </a>

                {/* Top Left - Pembayaran Cepat */}
                <a href="/#features" className="absolute top-16 left-8 md:left-16 group">
                  <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full shadow-xl flex flex-col items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-yellow-500">
                    <Zap className="w-10 h-10 md:w-12 md:h-12 text-yellow-600 mb-2" />
                    <p className="text-sm md:text-base font-bold text-yellow-700 text-center px-2">Pembayaran<br/>Cepat</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-gradient-to-br from-emerald-50 to-teal-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Keunggulan <span className="text-emerald-600">JEMPOL</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Solusi pembayaran digital yang aman, cepat, dan terpercaya untuk layanan kesehatan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-emerald-500">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Mudah</h3>
              <p className="text-gray-600">Bayar tagihan rumah sakit dengan berbagai metode pembayaran digital</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-blue-500">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Akses Mobile</h3>
              <p className="text-gray-600">Akses kapan saja, dimana saja melalui smartphone Anda</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-purple-500">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Keamanan Terjamin</h3>
              <p className="text-gray-600">Data dan transaksi Anda dilindungi dengan enkripsi tingkat tinggi</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-orange-500">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Instan</h3>
              <p className="text-gray-600">Dapatkan konfirmasi pembayaran secara real-time</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Layanan <span className="text-emerald-600">Kami</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Berbagai layanan pembayaran untuk memenuhi kebutuhan kesehatan Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-90"></div>
              <div className="relative p-8 text-white">
                <Heart className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Pembayaran Klinik</h3>
                <ul className="space-y-2 text-emerald-50">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Konsultasi Dokter</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Pemeriksaan Umum</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Rawat Jalan</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Rawat Inap</li>
                </ul>
              </div>
            </div>

            {/* Service 2 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-90"></div>
              <div className="relative p-8 text-white">
                <Activity className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Laboratorium</h3>
                <ul className="space-y-2 text-blue-50">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Tes Darah</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Tes Urine</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Medical Check Up</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Tes COVID-19</li>
                </ul>
              </div>
            </div>

            {/* Service 3 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-90"></div>
              <div className="relative p-8 text-white">
                <FileText className="w-16 h-16 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Radiologi</h3>
                <ul className="space-y-2 text-purple-50">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Rontgen</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> CT Scan</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> MRI</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> USG</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Registration Section */}
      <section id="registration" className="py-16 md:py-24 bg-gradient-to-br from-emerald-50 to-teal-50">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-xl">
                <Users className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Registrasi <span className="text-emerald-600">Pengunjung</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Daftarkan diri Anda untuk mengakses layanan JEMPOL
            </p>
          </div>
          <VisitorRegistrationForm />
        </Container>
      </section>

      {/* Materi JEMPOL Section */}
      <section id="materi" className="py-16 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-xl">
                <FileText className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Materi <span className="text-emerald-600">JEMPOL</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Pelajari lebih lanjut tentang JEMPOL melalui materi presentasi kami
            </p>
          </div>
          <InnovationGallery type="pdf" onItemClick={handleInnovationClick} />
        </Container>
      </section>

      {/* Video JEMPOL Section */}
      <section id="video" className="py-16 md:py-24 bg-gradient-to-br from-emerald-50 to-teal-50">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
                <Activity className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Video <span className="text-emerald-600">JEMPOL</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Tonton video penjelasan lengkap tentang JEMPOL
            </p>
          </div>
          <InnovationGallery type="video" onItemClick={handleInnovationClick} />
        </Container>
      </section>

      {/* Galeri Foto Section */}
      <section id="gallery" className="py-16 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-xl">
                <Building2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Galeri <span className="text-emerald-600">Foto</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Dokumentasi kegiatan dan inovasi JEMPOL
            </p>
          </div>
          <InnovationGallery type="photo" onItemClick={handleInnovationClick} />
        </Container>
      </section>

      {/* Innovation Viewer Modal */}
      <InnovationViewer
        item={selectedInnovation}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />

      {/* Game Section */}
      <section id="leaderboard" className="py-16 md:py-24 bg-gradient-to-br from-emerald-50 to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full filter blur-3xl"></div>
        </div>
        
        <Container>
          <div className="text-center mb-12 relative z-10">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <span className="text-4xl">🏆</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Leaderboard <span className="text-emerald-600">Game</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Lihat pemain terbaik di Innovation Catcher dan tantang diri Anda!
            </p>
            
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto mb-8 border-t-4 border-emerald-500">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <span className="text-2xl">🥇</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Juara 1</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <span className="text-2xl">🥈</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Juara 2</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <span className="text-2xl">🥉</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Juara 3</p>
                </div>
              </div>
              
              <Button
                onClick={() => (window.location.href = '/game')}
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                🎮 Lihat Leaderboard & Main Game
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              Raih skor tertinggi dan jadilah yang terbaik!
            </p>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        <Container>
          <div className="text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Siap Menggunakan JEMPOL?
            </h2>
            <p className="text-lg md:text-xl text-emerald-50 max-w-2xl mx-auto mb-8">
              Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan pembayaran digital untuk layanan kesehatan
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/#registration" 
                className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Users className="inline-block w-6 h-6 mr-2" />
                Daftar Sekarang
              </a>
              <a 
                href="/login" 
                className="px-8 py-4 bg-emerald-800 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl border-2 border-white transform hover:scale-105 transition-all"
              >
                <Globe className="inline-block w-6 h-6 mr-2" />
                Login
              </a>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}

export default HomePage;
