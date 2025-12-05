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
      <section id="home" className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Selamat Datang di{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Platform Inovasi
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Jelajahi inovasi terbaru, daftar sebagai pengunjung, dan mainkan game interaktif
            </p>
          </div>
        </Container>
      </section>

      {/* Registration Section */}
      <section id="registration" className="py-16">
        <Container>
          <VisitorRegistrationForm />
        </Container>
      </section>

      <section id="gallery" className="py-16 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Galeri Inovasi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Jelajahi berbagai inovasi dalam bentuk presentasi dan video
            </p>
          </div>
          <InnovationGallery onItemClick={handleInnovationClick} />
        </Container>
      </section>

      {/* Innovation Viewer Modal */}
      <InnovationViewer
        item={selectedInnovation}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />

      <section id="leaderboard" className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Leaderboard Game
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Lihat pemain terbaik di Innovation Catcher
            </p>
          </div>
          <div className="text-center">
            <Button
              onClick={() => (window.location.href = '/game')}
              size="lg"
            >
              Lihat Leaderboard & Main Game
            </Button>
          </div>
        </Container>
      </section>
    </Layout>
  );
}

export default HomePage;
