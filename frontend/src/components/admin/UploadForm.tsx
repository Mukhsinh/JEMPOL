import { useState, FormEvent, ChangeEvent } from 'react';
import { Upload, FileText, Video, CheckCircle } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { uploadInnovation } from '../../services/innovationService';

interface UploadFormProps {
  onUploadSuccess?: () => void;
}

const UploadForm = ({ onUploadSuccess }: UploadFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4',
        'video/webm',
        'video/x-msvideo',
      ];

      if (!validTypes.includes(selectedFile.type)) {
        setError('Tipe file tidak valid. Hanya PowerPoint dan Video yang diperbolehkan.');
        return;
      }

      // Validate file size (50MB)
      const maxSize = 50 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError('Ukuran file terlalu besar. Maksimal 50MB.');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.description) {
      setError('Judul dan deskripsi harus diisi');
      return;
    }

    if (!file) {
      setError('File harus dipilih');
      return;
    }

    setIsUploading(true);

    try {
      await uploadInnovation({
        title: formData.title,
        description: formData.description,
        file,
      });

      setShowSuccess(true);
      setFormData({ title: '', description: '' });
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupload file');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8" />;
    if (file.type.includes('video')) return <Video className="w-8 h-8 text-secondary-600" />;
    return <FileText className="w-8 h-8 text-primary-600" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Konten Inovasi</h2>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">Upload Berhasil!</p>
            <p className="text-green-700 text-sm mt-1">
              Konten inovasi telah ditambahkan ke galeri
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Judul"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Masukkan judul inovasi"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi <span className="text-primary-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:outline-none"
            placeholder="Jelaskan tentang inovasi ini"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File (PowerPoint atau Video) <span className="text-primary-500">*</span>
          </label>
          <div className="mt-1">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {getFileIcon()}
                <p className="mt-2 text-sm text-gray-600">
                  {file ? (
                    <span className="font-medium">{file.name}</span>
                  ) : (
                    <>
                      <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PPT, PPTX, MP4, WEBM, AVI (Max. 50MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".ppt,.pptx,.mp4,.webm,.avi"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isUploading}
        >
          {isUploading ? 'Mengupload...' : 'Upload Konten'}
        </Button>
      </form>
    </div>
  );
};

export default UploadForm;
