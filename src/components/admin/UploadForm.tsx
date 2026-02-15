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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log('File selected:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      });

      // Validate file extension
      const fileName = selectedFile.name.toLowerCase();
      const validExtensions = ['.ppt', '.pptx', '.pdf', '.mp4', '.webm', '.avi', '.mov', '.mkv', '.mpeg', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

      if (!hasValidExtension) {
        setError('Tipe file tidak valid. Hanya PowerPoint (.ppt, .pptx), PDF (.pdf), Video (.mp4, .webm, .avi), dan Foto (.jpg, .png, .gif, .webp) yang diperbolehkan.');
        e.target.value = '';
        return;
      }

      // Validate file type
      const validTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/pdf',
        'video/mp4',
        'video/webm',
        'video/x-msvideo',
        'video/avi',
        'video/quicktime',
        'video/mpeg',
        'video/x-matroska',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      // Some browsers might not set correct MIME type, so we check extension too
      if (selectedFile.type && !validTypes.includes(selectedFile.type) && !hasValidExtension) {
        setError('Tipe file tidak valid. Hanya PowerPoint, PDF, Video, dan Foto yang diperbolehkan.');
        e.target.value = '';
        return;
      }

      // Validate file size based on type
      let maxSize: number;
      let maxSizeLabel: string;
      
      if (fileName.endsWith('.mp4') || fileName.endsWith('.webm') || fileName.endsWith('.avi') || fileName.endsWith('.mov') || fileName.endsWith('.mkv')) {
        maxSize = 1024 * 1024 * 1024; // 1GB for videos
        maxSizeLabel = '1GB';
      } else if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx') || fileName.endsWith('.pdf')) {
        maxSize = 100 * 1024 * 1024; // 100MB for PowerPoint and PDF
        maxSizeLabel = '100MB';
      } else {
        maxSize = 50 * 1024 * 1024; // 50MB for photos
        maxSizeLabel = '50MB';
      }
      
      if (selectedFile.size > maxSize) {
        setError(`Ukuran file terlalu besar (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB). Maksimal ${maxSizeLabel}.`);
        e.target.value = '';
        return;
      }

      if (selectedFile.size === 0) {
        setError('File kosong atau tidak valid.');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setError(null);
      console.log('File validation passed');
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
      console.log('Starting upload...', {
        title: formData.title,
        description: formData.description,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const result = await uploadInnovation(
        {
          title: formData.title,
          description: formData.description,
          file,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      console.log('Upload successful:', result);

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
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupload file. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8" />;
    if (file.type.includes('video')) return <Video className="w-8 h-8 text-secondary-600" />;
    if (file.type.includes('image')) return <span className="text-4xl">📸</span>;
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
            File (PowerPoint, PDF, Video, atau Foto) <span className="text-primary-500">*</span>
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
                  PPT/PPTX/PDF (Max. 100MB), Video MP4/WEBM/AVI (Max. 1GB), Foto JPG/PNG/GIF (Max. 50MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".ppt,.pptx,.pdf,.mp4,.webm,.avi,.mov,.mkv,.mpeg,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {isUploading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Mengupload...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isUploading}
          disabled={isUploading}
        >
          {isUploading ? `Mengupload... ${uploadProgress}%` : 'Upload Konten'}
        </Button>
      </form>
    </div>
  );
};

export default UploadForm;
