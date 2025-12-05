import { useState } from 'react';
import Layout from '../components/layout/Layout';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import VisitorRegistrationForm from '../components/visitor/VisitorRegistrationForm';
import InnovationGallery from '../components/innovation/InnovationGallery';
import InnovationViewer from '../components/innovation/InnovationViewer';
import { InnovationItem } from '../types';

function HomePage() {
  const [selectedInnovation, setSelectedInnovation] = useState<InnovationItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleInnovationClick = (item: InnovationItem) => {
    setSelectedInnovation(item);
    setIsViewerOpen(true);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 md:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <Container>
          <div className="text-center relative z-10">
            <div className="inline-block mb-6 animate-bounce">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform">
                <span className="text-4xl md:text-5xl">💳</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-4">
              Selamat Datang di{' '}
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 bg-clip-text text-transparent animate-pulse">
                JEMPOL
              </span>
            </h1>
            
            <div className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full px-8 py-3 mb-6 shadow-lg">
              <p className="text-xl md:text-2xl font-bold text-white">
                Jembatan Pembayaran Online
              </p>
            </div>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Platform inovatif untuk menampilkan solusi pembayaran digital, 
              mendaftar sebagai pengunjung, dan menikmati pengalaman interaktif
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/#registration" 
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                🎯 Daftar Sekarang
              </a>
              <a 
                href="/#gallery" 
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl border-2 border-gray-200 transform hover:scale-105 transition-all"
              >
                🔍 Lihat Galeri
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Registration Section */}
      <section id="registration" className="py-16">
        <Container>
          <VisitorRegistrationForm />
        </Container>
      </section>

      {/* Materi JEMPOL Section */}
      <section id="materi" className="py-16 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-5xl">📄</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Materi <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">JEMPOL</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Pelajari lebih lanjut tentang JEMPOL melalui materi presentasi kami
            </p>
          </div>
          <InnovationGallery type="pdf" onItemClick={handleInnovationClick} />
        </Container>
      </section>

      {/* Video JEMPOL Section */}
      <section id="video" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-5xl">🎥</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Video <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">JEMPOL</span>
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
              <span className="text-5xl">📸</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Galeri <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Foto</span>
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

      <section id="leaderboard" className="py-16 md:py-24 bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl"></div>
        </div>
        
        <Container>
          <div className="text-center mb-12 relative z-10">
            <div className="inline-block mb-4">
              <span className="text-6xl animate-bounce">🏆</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Leaderboard <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Game</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Lihat pemain terbaik di Innovation Catcher dan tantang diri Anda!
            </p>
            
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto mb-8">
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
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
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
    </Layout>
  );
}

export default HomePage;
