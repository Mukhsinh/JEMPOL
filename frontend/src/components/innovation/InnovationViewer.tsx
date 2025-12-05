import { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import Button from '../ui/Button';
import { InnovationItem } from '../../types';
import { incrementView } from '../../services/innovationService';

interface PowerPointViewerProps {
  fileUrl: string;
  item: InnovationItem;
}

function PowerPointViewer({ fileUrl, item }: PowerPointViewerProps) {
  const [viewerType, setViewerType] = useState<'office' | 'google' | 'download'>('office');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if running on localhost
  const isLocalhost = fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1');
  
  // Get public URL from environment or use localhost
  const publicUrl = (import.meta as any).env?.VITE_PUBLIC_URL || fileUrl;
  const displayUrl = isLocalhost ? fileUrl : publicUrl;

  useEffect(() => {
    // Reset states when viewer type changes
    setIsLoading(true);
    setHasError(false);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [viewerType]);

  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(displayUrl)}`;
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(displayUrl)}&embedded=true`;

  if (isLocalhost && viewerType !== 'download') {
    return (
      <div className="space-y-4 p-4">
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-yellow-900 mb-2">
                ⚠️ PowerPoint Tidak Dapat Ditampilkan di Localhost
              </h4>
              <p className="text-xs text-yellow-800 mb-3">
                Office Online Viewer dan Google Docs Viewer memerlukan URL publik yang dapat diakses dari internet. 
                Localhost (http://localhost:5000) tidak dapat diakses oleh server eksternal.
              </p>
              <div className="bg-white rounded-lg p-4 mb-3">
                <p className="text-xs font-semibold text-gray-900 mb-2">Solusi:</p>
                <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Download file PowerPoint dan buka dengan aplikasi lokal</li>
                  <li>Deploy aplikasi ke server dengan domain publik</li>
                  <li>Gunakan ngrok untuk expose localhost ke internet (untuk testing)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 text-center border-2 border-orange-200">
          <div className="bg-white rounded-2xl p-8 shadow-lg inline-block mb-6">
            <svg className="w-24 h-24 text-orange-600 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              <path d="M14 2v6h6"/>
              <path d="M9 13h6v2H9z"/>
              <path d="M9 17h6v2H9z"/>
            </svg>
            <p className="text-lg font-bold text-gray-800 mt-4">{item.fileName || item.file_name}</p>
            <p className="text-sm text-gray-600 mt-1">
              {item.fileSize ? `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'PowerPoint Presentation'}
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={fileUrl}
              download={item.fileName || item.file_name}
              className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-bold text-lg rounded-lg hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PowerPoint
            </a>
            
            <p className="text-sm text-gray-600">
              File akan didownload ke komputer Anda.<br />
              Buka dengan Microsoft PowerPoint, LibreOffice Impress, atau Google Slides.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            💡 <strong>Tips:</strong> Untuk melihat presentasi langsung di browser, deploy aplikasi ke server dengan domain publik (misalnya: Vercel, Netlify, atau VPS).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          📄 Materi JEMPOL - PowerPoint Presentation
        </p>
        <p className="text-xs text-blue-700">
          Presentasi PowerPoint ditampilkan langsung di bawah ini. Gunakan kontrol untuk navigasi slide.
        </p>
      </div>

      {/* Viewer Type Selector */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => setViewerType('office')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewerType === 'office'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Office Online
        </button>
        <button
          onClick={() => setViewerType('google')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewerType === 'google'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Google Docs
        </button>
        <button
          onClick={() => setViewerType('download')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewerType === 'download'
              ? 'bg-orange-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Download
        </button>
      </div>

      {viewerType === 'download' ? (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 text-center border-2 border-orange-200">
          <div className="bg-white rounded-2xl p-8 shadow-lg inline-block mb-6">
            <svg className="w-24 h-24 text-orange-600 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              <path d="M14 2v6h6"/>
              <path d="M9 13h6v2H9z"/>
              <path d="M9 17h6v2H9z"/>
            </svg>
            <p className="text-lg font-bold text-gray-800 mt-4">{item.fileName || item.file_name}</p>
            <p className="text-sm text-gray-600 mt-1">
              {item.fileSize ? `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'PowerPoint Presentation'}
            </p>
          </div>

          <a
            href={fileUrl}
            download={item.fileName || item.file_name}
            className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-bold text-lg rounded-lg hover:bg-orange-700 transition-colors shadow-lg"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PowerPoint
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-200 relative">
          {isLoading && !hasError && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Memuat presentasi...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={viewerType === 'office' ? officeViewerUrl : googleViewerUrl}
            className="w-full"
            style={{ height: '70vh', minHeight: '600px' }}
            frameBorder="0"
            title={item.title}
            onLoad={() => {
              setIsLoading(false);
              setHasError(false);
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />

          {hasError && (
            <div className="absolute inset-0 bg-white flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-800 font-semibold mb-2">Gagal memuat presentasi</p>
                <p className="text-sm text-gray-600 mb-4">
                  Viewer {viewerType === 'office' ? 'Office Online' : 'Google Docs'} tidak dapat memuat file.
                </p>
                <button
                  onClick={() => setViewerType(viewerType === 'office' ? 'google' : 'download')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Coba Viewer Lain
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-center flex-wrap">
        <a
          href={viewerType === 'office' ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(displayUrl)}` : googleViewerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Buka di Tab Baru
        </a>
        <a
          href={fileUrl}
          download={item.fileName || item.file_name}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download File
        </a>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-xs text-yellow-800">
          💡 <strong>Catatan:</strong> Jika presentasi tidak tampil dengan baik, coba viewer lain atau gunakan tombol "Download File" untuk membuka dengan aplikasi PowerPoint lokal.
        </p>
      </div>
    </div>
  );
}

interface InnovationViewerProps {
  item: InnovationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InnovationViewer({ item, isOpen, onClose }: InnovationViewerProps) {
  useEffect(() => {
    if (item && isOpen) {
      const id = item._id || item.id;
      if (id) {
        incrementView(id).catch(console.error);
      }
    }
  }, [item, isOpen]);

  if (!item || !isOpen) return null;

  const API_BASE_URL = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const fileUrl = `${API_BASE_URL}${item.fileUrl || item.file_url}`;
  const type = item.type || item.category;

  const descriptionParagraphs = item.description.split('\n').filter(p => p.trim());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-2 sm:p-4 text-center">
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block w-full max-w-6xl my-4 sm:my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-xl sm:rounded-2xl relative z-10">
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex-1 pr-2">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h2>
              <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{item.views || 0} views</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="text-xs">
                  {new Date(item.uploadedAt || item.uploaded_at || '').toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="p-3 sm:p-6 max-h-[calc(100vh-150px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Deskripsi</h3>
              <div className="prose prose-sm max-w-none">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={index} className="text-sm sm:text-base text-gray-700 leading-relaxed mb-2 sm:mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden">
              {type === 'video' ? (
                <div className="space-y-2 sm:space-y-3 p-2 sm:p-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-blue-800 font-medium">
                      🎥 Video JEMPOL dapat diputar langsung di bawah ini
                    </p>
                  </div>
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      controlsList="nodownload"
                      preload="metadata"
                      className="w-full max-h-[50vh] sm:max-h-[65vh] object-contain"
                      src={fileUrl}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    >
                      <source src={fileUrl} type="video/mp4" />
                      <source src={fileUrl} type="video/webm" />
                      <source src={fileUrl} type="video/quicktime" />
                      Browser Anda tidak mendukung video player.
                    </video>
                  </div>
                </div>
              ) : type === 'photo' ? (
                <div className="p-2 sm:p-4">
                  <img
                    src={fileUrl}
                    alt={item.title}
                    className="w-full h-auto max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              ) : type === 'pdf' ? (
                <div className="bg-white overflow-hidden">
                  <iframe
                    src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    className="w-full"
                    style={{ height: '60vh', minHeight: '400px' }}
                    frameBorder="0"
                    title={item.title}
                  />
                </div>
              ) : (
                <PowerPointViewer fileUrl={fileUrl} item={item} />
              )}
            </div>
          </div>

          <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
