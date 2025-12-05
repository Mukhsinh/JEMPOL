import { useState } from 'react';
import { Settings, Upload as UploadIcon, Users } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Container from '../components/layout/Container';
import UploadForm from '../components/admin/UploadForm';
import VisitorManagement from '../components/admin/VisitorManagement';

function AdminPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'visitors'>('upload');

  return (
    <Layout>
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <Container>
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-3 rounded-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Kelola konten dan data pengunjung</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors
                ${activeTab === 'upload'
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
                }
              `}
            >
              <UploadIcon className="w-5 h-5" />
              <span>Upload Konten</span>
            </button>
            <button
              onClick={() => setActiveTab('visitors')}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors
                ${activeTab === 'visitors'
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
                }
              `}
            >
              <Users className="w-5 h-5" />
              <span>Data Pengunjung</span>
            </button>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'upload' && <UploadForm onUploadSuccess={() => {}} />}
            {activeTab === 'visitors' && <VisitorManagement />}
          </div>
        </Container>
      </div>
    </Layout>
  );
}

export default AdminPage;
