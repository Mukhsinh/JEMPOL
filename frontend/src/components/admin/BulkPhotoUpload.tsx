import { useState, FormEvent, ChangeEvent } from 'react';
import { X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { uploadBulkPhotos } from '../../services/innovationService';

interface BulkPhotoUploadProps {
  onUploadSuccess?: () => void;
}

const BulkPhotoUpload = ({ onUploadSuccess }: BulkPhotoUploadProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    if (selectedFiles.length > 10) {
      setError('Maksimal 10 foto sekaligus');
      e.target.value = '';
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    selectedFiles.forEach(file => {
      // Validate file type
      if (!file.type.includes('image')) {
        errors.push(`${file.name}: Bukan file foto`);
        return;
      }

      // Validate file size (50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(`${file.name}: Terlalu besar (max 50MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      e.target.value = '';
      return;
    }

    setFiles(validFiles);
    setError(null);

    // Create preview URLs
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the removed URL
    URL.revokeObjectURL(previewUrls[index]);
    
    setFiles(newFiles);
    setPreviewUrls(newUrls);

    // Reset file input if no files left
    if (newFiles.length === 0) {
      const fileInput = document.getElementById('bulk-file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.description) {
      setError('Judul dan deskripsi harus diisi');
      return;
    }

    if (files.length === 0) {
      setError('Minimal 1 foto harus dipilih');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadBulkPhotos(
        {
          title: formData.title,
          description: formData.description,
          files,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      console.log('Bulk upload successful:', result);

      setShowSuccess(true);
      setFormData({ title: '', description: '' });
      setFiles([]);
      
      // Revoke all preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);

      // Reset file input
      const fileInput = document.getElementById('bulk-file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error('Bulk upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupload foto. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Multiple Foto</h2>
      <p className="text-gray-600 text-sm mb-6">Upload hingga 10 foto sekaligus</p>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">Upload Berhasil!</p>
            <p className="text-green-700 text-sm mt-1">
              {files.length} foto telah ditambahkan ke galeri
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
          label="Judul Dasar"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Contoh: Inovasi Pelayanan"
          required
          helperText="Setiap foto akan diberi nomor urut otomatis"
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
            placeholder="Deskripsi akan digunakan untuk semua foto"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Foto (Max 10) <span className="text-primary-500">*</span>
          </label>
          <div className="mt-1">
            <label
              htmlFor="bulk-file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Klik untuk pilih foto</span> atau drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, WEBP (Max. 50MB per foto, max 10 foto)
                </p>
              </div>
              <input
                id="bulk-file-upload"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                multiple
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* Preview Grid */}
        {files.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              {files.length} foto dipilih
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={previewUrls[index]}
                    alt={file.name}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isUploading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Mengupload {files.length} foto...</span>
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
          disabled={isUploading || files.length === 0}
        >
          {isUploading ? `Mengupload... ${uploadProgress}%` : `Upload ${files.length} Foto`}
        </Button>
      </form>
    </div>
  );
};

export default BulkPhotoUpload;
