import React from 'react';
import { Download, BookOpen, FileText, Settings, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BukuPetunjuk: React.FC = () => {
  const navigate = useNavigate();
  
  const ebooks = [
    {
      id: 1,
      title: 'E-Book Gambaran Umum Aplikasi KISS',
      subtitle: 'Kanal Informasi Saran dan Survei',
      description: 'Panduan lengkap mengenai gambaran umum sistem KISS, dasar regulasi, fitur utama, manfaat, dan arsitektur teknologi yang digunakan.',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'bg-blue-500',
      chapters: [
        'Pendahuluan dan Latar Belakang',
        'Dasar Regulasi dan Landasan Hukum',
        'Gambaran Umum Sistem',
        'Fitur Utama dan Keunggulan',
        'Manfaat untuk Stakeholder',
        'Arsitektur Teknologi',
        'Keamanan dan Privasi',
        'Implementasi dan Deployment',
        'Kesimpulan dan Roadmap'
      ],
      filename: 'ebook-gambaran-umum-kiss.md',
      size: '2.1 MB'
    },
    {
      id: 2,
      title: 'E-Book Alur Teknis Aplikasi KISS',
      subtitle: 'Technical Architecture & Database Design',
      description: 'Dokumentasi teknis lengkap meliputi arsitektur sistem, database schema, API design, alur data, dan integrasi sistem.',
      icon: <Settings className="w-8 h-8" />,
      color: 'bg-green-500',
      chapters: [
        'Arsitektur Sistem',
        'Database Schema dan Relasi',
        'API Architecture',
        'Alur Data dan Proses',
        'Integrasi Sistem',
        'Security Implementation',
        'Performance Optimization',
        'Monitoring dan Logging',
        'Deployment Architecture'
      ],
      filename: 'ebook-alur-teknis-kiss.md',
      size: '1.8 MB'
    },
    {
      id: 3,
      title: 'E-Book Petunjuk Teknis Aplikasi KISS',
      subtitle: 'Operational Manual & User Guide',
      description: 'Panduan operasional lengkap dari instalasi, konfigurasi, manajemen user, operasional harian, hingga troubleshooting dengan studi kasus.',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-purple-500',
      chapters: [
        'Persiapan dan Instalasi',
        'Penyusunan Data Master',
        'Konfigurasi Sistem',
        'Manajemen User dan Role',
        'Operasional Harian',
        'Penanganan Keluhan',
        'Monitoring dan Reporting',
        'Maintenance dan Troubleshooting',
        'Studi Kasus dan Contoh'
      ],
      filename: 'ebook-petunjuk-teknis-kiss.md',
      size: '2.5 MB'
    }
  ];

  const handleDownloadPDF = (filename: string, title: string) => {
    // Map filename to actual PDF filename
    const pdfMapping: { [key: string]: string } = {
      'ebook-gambaran-umum-kiss.md': 'KISS_Gambaran_Umum.pdf',
      'ebook-alur-teknis-kiss.md': 'KISS_Alur_Teknis.pdf',
      'ebook-petunjuk-teknis-kiss.md': 'KISS_Petunjuk_Teknis.pdf'
    };
    
    const pdfFilename = pdfMapping[filename] || filename.replace('.md', '.pdf');
    
    // Create download link
    const link = document.createElement('a');
    link.href = `/ebooks/${pdfFilename}`;
    link.download = pdfFilename;
    link.click();
    
    // Track download
    console.log(`Downloaded PDF: ${title}`);
  };

  const handleViewOnline = (filename: string) => {
    // Map filename to actual HTML filename
    const htmlMapping: { [key: string]: string } = {
      'ebook-gambaran-umum-kiss.md': 'KISS_Gambaran_Umum.html',
      'ebook-alur-teknis-kiss.md': 'KISS_Alur_Teknis.html',
      'ebook-petunjuk-teknis-kiss.md': 'KISS_Petunjuk_Teknis.html'
    };
    
    const htmlFilename = htmlMapping[filename] || filename.replace('.md', '.html');
    window.open(`/ebooks/${htmlFilename}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <FileText className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Buku Petunjuk Aplikasi KISS
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Koleksi lengkap dokumentasi dan panduan untuk Aplikasi KISS (Kanal Informasi Saran dan Survei)
          </p>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-800 font-medium">
              Penulis dan Pengembang: MUKHSIN HADI, SE, M.Si, CGAA, CPFRM, CSEP, CRP, CPRM, CSCAP, CPABC
            </p>
            <p className="text-blue-600 text-sm mt-1">
              © 2024 aplikasiKISS@2024.Mukhsin Hadi. Hak Cipta dilindungi oleh Undang-Undang
            </p>
          </div>
        </div>

        {/* E-Books Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {ebooks.map((ebook) => (
            <div key={ebook.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Header */}
              <div className={`${ebook.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  {ebook.icon}
                  <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {ebook.size}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{ebook.title}</h3>
                <p className="text-sm opacity-90">{ebook.subtitle}</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {ebook.description}
                </p>

                {/* Chapters */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Daftar Isi:</h4>
                  <ul className="space-y-2">
                    {ebook.chapters.slice(0, 5).map((chapter, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-gray-400 mr-2 mt-1">•</span>
                        <span className="text-sm text-gray-600">{chapter}</span>
                      </li>
                    ))}
                    {ebook.chapters.length > 5 && (
                      <li className="text-sm text-gray-400 ml-4">
                        +{ebook.chapters.length - 5} bab lainnya...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleViewOnline(ebook.filename)}
                    className={`w-full ${ebook.color} text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-200 flex items-center justify-center`}
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Baca Online
                  </button>
                  
                  <button
                    onClick={() => handleDownloadPDF(ebook.filename, ebook.title)}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Unduh PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Tambahan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Format dan Kompatibilitas</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Format PDF - Dapat dibaca langsung di browser, mudah dicetak dan disimpan
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Baca Online - Dapat dibaca langsung di browser dengan navigasi yang mudah
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Kompatibel dengan semua perangkat (desktop, tablet, mobile)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Mendukung pencarian teks dan bookmark
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cara Penggunaan</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Klik "Baca Online" untuk membaca langsung di browser
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Klik "Unduh PDF" untuk menyimpan file ke perangkat Anda
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  PDF dapat dibuka dengan Adobe Reader atau browser apapun
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Gunakan Ctrl+F untuk mencari teks tertentu dalam dokumen
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Catatan Penting</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Dokumentasi ini merupakan panduan resmi untuk Aplikasi KISS. Pastikan Anda menggunakan versi terbaru 
                  dan mengikuti prosedur yang telah ditetapkan. Untuk pertanyaan teknis, hubungi tim support.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <div className="bg-gray-800 text-white rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-4">Butuh Bantuan?</h3>
            <p className="text-gray-300 mb-6">
              Jika Anda memerlukan bantuan teknis atau memiliki pertanyaan mengenai dokumentasi ini, 
              jangan ragu untuk menghubungi tim support kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center justify-center">
                <span className="text-gray-400 mr-2">📧</span>
                <span>support@kiss-app.com</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-gray-400 mr-2">🌐</span>
                <span>www.kiss-app.com</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-gray-400 mr-2">📱</span>
                <span>http://wa.me/085726112001</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BukuPetunjuk;