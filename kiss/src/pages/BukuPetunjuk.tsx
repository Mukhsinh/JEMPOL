import React, { useState } from 'react';
import { BookOpen, Download, Eye, FileText, Users, Settings } from 'lucide-react';

interface EbookInfo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  pages: number;
  category: string;
  htmlFile: string;
  pdfFile: string;
}

const BukuPetunjuk: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);

  // Data e-book yang sudah ada berdasarkan dokumentasi
  const ebooks: EbookInfo[] = [
    {
      id: 'gambaran-umum',
      title: 'E-Book Gambaran Umum Aplikasi KISS',
      subtitle: 'Kanal Informasi Saran dan Survei',
      description: 'Dokumentasi lengkap tentang gambaran umum, latar belakang, dasar regulasi, dan landasan hukum aplikasi KISS. Mencakup fitur-fitur utama, arsitektur sistem, dan manfaat implementasi.',
      pages: 156,
      category: 'Gambaran Umum',
      htmlFile: 'KISS_Gambaran_Umum.html',
      pdfFile: 'KISS_Gambaran_Umum.pdf'
    },
    {
      id: 'alur-teknis',
      title: 'E-Book Alur Teknis Aplikasi KISS',
      subtitle: 'Dokumentasi Teknis Lengkap',
      description: 'Panduan teknis komprehensif meliputi arsitektur sistem, struktur database, API endpoints, alur data, keamanan, monitoring, dan deployment aplikasi KISS.',
      pages: 198,
      category: 'Teknis',
      htmlFile: 'KISS_Alur_Teknis.html',
      pdfFile: 'KISS_Alur_Teknis.pdf'
    },
    {
      id: 'petunjuk-teknis',
      title: 'E-Book Petunjuk Teknis Aplikasi KISS',
      subtitle: 'Panduan Operasional',
      description: 'Petunjuk operasional lengkap untuk instalasi, setup, konfigurasi, pengelolaan keluhan, survei kepuasan, QR Code management, dashboard, dan troubleshooting.',
      pages: 224,
      category: 'Operasional',
      htmlFile: 'KISS_Petunjuk_Teknis.html',
      pdfFile: 'KISS_Petunjuk_Teknis.pdf'
    }
  ];

  const handleViewHTML = (ebook: EbookInfo) => {
    const htmlUrl = `/ebooks/${ebook.htmlFile}`;
    window.open(htmlUrl, '_blank');
  };

  const handleDownloadPDF = async (ebook: EbookInfo) => {
    try {
      setLoading(ebook.id);
      
      // Create a link to download PDF
      const link = document.createElement('a');
      link.href = `/ebooks/${ebook.pdfFile}`;
      link.download = ebook.pdfFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Simulate download delay
      setTimeout(() => setLoading(null), 1000);
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      setLoading(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Gambaran Umum':
        return <BookOpen className="w-6 h-6" />;
      case 'Teknis':
        return <Settings className="w-6 h-6" />;
      case 'Operasional':
        return <Users className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Gambaran Umum':
        return 'bg-blue-100 text-blue-800';
      case 'Teknis':
        return 'bg-green-100 text-green-800';
      case 'Operasional':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <BookOpen className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Buku Petunjuk Aplikasi KISS
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Koleksi lengkap dokumentasi dan panduan untuk Kanal Informasi Saran dan Survei (KISS). 
            Unduh e-book profesional dalam format PDF.
          </p>
        </div>

        {/* Author Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Penulis dan Pengembang</h3>
            <p className="text-blue-600 font-medium">
              MUKHSIN HADI, SE, M.Si, CGAA, CPFRM, CSEP, CRP, CPRM, CSCAP, CPABC
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Praktisi dan akademisi di bidang sistem informasi manajemen dengan pengalaman lebih dari 15 tahun 
              dalam pengembangan aplikasi enterprise untuk sektor publik.
            </p>
          </div>
        </div>

        {/* E-books Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {ebooks.map((ebook) => (
            <div key={ebook.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Card Header */}
              <div className="bg-blue-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  {getCategoryIcon(ebook.category)}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(ebook.category)} bg-white`}>
                    {ebook.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{ebook.title}</h3>
                <p className="text-blue-100 text-sm">{ebook.subtitle}</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {ebook.description}
                </p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="w-4 h-4 mr-1" />
                    {ebook.pages} halaman
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleDownloadPDF(ebook)}
                    disabled={loading === ebook.id}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === ebook.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Mengunduh...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Unduh E-Book (PDF)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Hak Cipta</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>© 2024 MUKHSIN HADI, SE, M.Si, CGAA, CPFRM, CSEP, CRP, CPRM, CSCAP, CPABC</p>
              <p>aplikasiKISS@2024.Mukhsin Hadi</p>
              <p className="font-medium">Hak Cipta dilindungi oleh Undang-Undang</p>
              <p className="text-xs">
                Dilarang memperbanyak sebagian atau seluruh isi e-book ini tanpa izin tertulis dari penulis.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
            <div className="text-gray-600">E-Book Tersedia</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">578</div>
            <div className="text-gray-600">Total Halaman</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">1</div>
            <div className="text-gray-600">Format Tersedia</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BukuPetunjuk;