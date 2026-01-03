import React, { useState, useEffect } from 'react';
import ebookService, { EbookSection } from '../services/ebookService';

const BukuPetunjuk: React.FC = () => {
  const [sections, setSections] = useState<EbookSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    fetchEbookContent();
  }, []);

  const fetchEbookContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const ebookSections = await ebookService.getEbookSections();

      setSections(ebookSections);
      if (ebookSections.length > 0) {
        setActiveSection(ebookSections[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching ebook content:', err);
      setError(err.message || 'Failed to fetch ebook content');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (sectionId: string) => {
    try {
      // Create a link to download PDF
      const link = document.createElement('a');
      link.href = `/ebooks/KISS_${sectionId.replace('-', '_')}.pdf`;
      link.download = `KISS_${sectionId.replace('-', '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      setError(err.message || 'Failed to download PDF');
    }
  };

  const handleViewHTML = (sectionId: string) => {
    const htmlUrl = `/ebooks/KISS_${sectionId.replace('-', '_')}.html`;
    window.open(htmlUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buku Petunjuk KISS</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daftar Isi</h3>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`p-6 ${activeSection === section.id ? 'block' : 'hidden'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewHTML(section.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      View HTML
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(section.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BukuPetunjuk;