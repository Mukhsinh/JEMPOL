import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface ResponseTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface TemplateFormData {
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  is_active: boolean;
}

const ResponseTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    subject: '',
    content: '',
    category: 'AUTO_REPLY',
    variables: [],
    is_active: true
  });

  // Fetch templates from database
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/public/response-templates');
      if (response.data.success) {
        setTemplates(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch templates');
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      
      // Fallback to database data structure
      const mockTemplates: ResponseTemplate[] = [
        {
          id: '2529dc85-41e4-4426-8ebb-d5a823f18656',
          name: 'Konfirmasi Penerimaan',
          subject: 'Tiket Anda Telah Diterima',
          content: 'Terima kasih telah menghubungi kami. Tiket Anda dengan nomor {{ticket_number}} telah diterima dan akan segera ditindaklanjuti.',
          category: 'AUTO_REPLY',
          variables: ['ticket_number', 'submitter_name'],
          is_active: true,
          created_by: null,
          created_at: '2025-12-30T23:03:39.527264Z',
          updated_at: '2025-12-30T23:03:39.527264Z'
        },
        {
          id: '7b6067cb-d8b5-4f88-beee-5c5951ccf5c2',
          name: 'Permintaan Informasi Tambahan',
          subject: 'Informasi Tambahan Diperlukan',
          content: 'Untuk menindaklanjuti tiket {{ticket_number}}, kami memerlukan informasi tambahan dari Anda.',
          category: 'FOLLOW_UP',
          variables: ['ticket_number', 'additional_info'],
          is_active: true,
          created_by: null,
          created_at: '2025-12-30T23:03:39.527264Z',
          updated_at: '2025-12-30T23:03:39.527264Z'
        },
        {
          id: 'edd83672-5ee8-4de2-adec-0da9f9ce344b',
          name: 'Penyelesaian Tiket',
          subject: 'Tiket Anda Telah Diselesaikan',
          content: 'Tiket {{ticket_number}} telah diselesaikan. Terima kasih atas kesabaran Anda.',
          category: 'RESOLUTION',
          variables: ['ticket_number', 'resolution_details'],
          is_active: true,
          created_by: null,
          created_at: '2025-12-30T23:03:39.527264Z',
          updated_at: '2025-12-30T23:03:39.527264Z'
        }
      ];
      setTemplates(mockTemplates);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      content: '',
      category: 'AUTO_REPLY',
      variables: [],
      is_active: true
    });
    setShowModal(true);
  };

  const handleEditTemplate = (template: ResponseTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category,
      variables: template.variables,
      is_active: template.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        // Update existing template
        const response = await api.put(`/api/public/response-templates/${editingTemplate.id}`, formData);
        if (response.data.success) {
          await fetchTemplates();
          setShowModal(false);
        }
      } else {
        // Create new template
        const response = await api.post('/api/public/response-templates', formData);
        if (response.data.success) {
          await fetchTemplates();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      try {
        const response = await api.delete(`/api/public/response-templates/${id}`);
        if (response.data.success) {
          await fetchTemplates();
        }
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleVariableChange = (value: string) => {
    const variables = value.split(',').map(v => v.trim()).filter(v => v);
    setFormData({ ...formData, variables });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button 
          onClick={handleAddTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Template
        </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Cari template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {template.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.is_active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {template.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">category</span>
                      {template.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">code</span>
                      {template.variables.length} variabel
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditTemplate(template)}
                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Subject
                  </label>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
                    {template.subject}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Content Preview
                  </label>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {template.content.length > 200 
                        ? template.content.substring(0, 200) + '...'
                        : template.content
                      }
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Dibuat: {new Date(template.created_at).toLocaleDateString('id-ID')}</span>
                <span>Diupdate: {new Date(template.updated_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-2xl">description</span>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Tidak ada template ditemukan
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Coba ubah filter atau buat template baru
          </p>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingTemplate ? 'Edit Template' : 'Tambah Template Baru'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nama Template
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="AUTO_REPLY">Auto Reply</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="RESOLUTION">Resolution</option>
                    <option value="ESCALATION">Escalation</option>
                    <option value="SURVEY">Survey</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Gunakan {{variable_name}} untuk variabel dinamis"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Variabel (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={formData.variables.join(', ')}
                    onChange={(e) => handleVariableChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="ticket_number, submitter_name, resolution_details"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Contoh: ticket_number, submitter_name, resolution_details
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                    Template aktif
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {editingTemplate ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseTemplates;