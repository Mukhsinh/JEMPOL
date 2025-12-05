import { useState, FormEvent } from 'react';
import { User, Building2, Briefcase, Phone, CheckCircle } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { VisitorFormData, ValidationError } from '../../types';
import { validateVisitorForm } from '../../utils/validation';
import { registerVisitor } from '../../services/visitorService';

interface VisitorRegistrationFormProps {
  onSubmitSuccess?: (visitor: VisitorFormData) => void;
  onSubmitError?: (error: string) => void;
}

const VisitorRegistrationForm = ({
  onSubmitSuccess,
  onSubmitError,
}: VisitorRegistrationFormProps) => {
  const [formData, setFormData] = useState<VisitorFormData>({
    nama: '',
    instansi: '',
    jabatan: '',
    noHandphone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setShowSuccess(false);

    // Validate form
    const validation = validateVisitorForm(formData);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((error: ValidationError) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Call API
      await registerVisitor(formData);
      
      // Success
      setShowSuccess(true);
      
      // Clear form
      const clearedForm = {
        nama: '',
        instansi: '',
        jabatan: '',
        noHandphone: '',
      };
      setFormData(clearedForm);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(formData);
      }

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mendaftar';
      setErrors({ submit: errorMessage });
      if (onSubmitError) {
        onSubmitError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Pendaftaran Pengunjung
          </h2>
          <p className="text-gray-600">
            Silakan isi formulir di bawah ini untuk mendaftar sebagai pengunjung
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">Pendaftaran Berhasil!</p>
              <p className="text-green-700 text-sm mt-1">
                Terima kasih telah mendaftar. Data Anda telah tersimpan.
              </p>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama Lengkap"
            name="nama"
            type="text"
            value={formData.nama}
            onChange={handleChange}
            error={errors.nama}
            icon={User}
            placeholder="Masukkan nama lengkap Anda"
            required
          />

          <Input
            label="Instansi"
            name="instansi"
            type="text"
            value={formData.instansi}
            onChange={handleChange}
            error={errors.instansi}
            icon={Building2}
            placeholder="Nama instansi/organisasi"
            required
          />

          <Input
            label="Jabatan"
            name="jabatan"
            type="text"
            value={formData.jabatan}
            onChange={handleChange}
            error={errors.jabatan}
            icon={Briefcase}
            placeholder="Jabatan Anda"
            required
          />

          <Input
            label="Nomor Handphone"
            name="noHandphone"
            type="tel"
            value={formData.noHandphone}
            onChange={handleChange}
            error={errors.noHandphone}
            icon={Phone}
            placeholder="08xx xxxx xxxx"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Data Anda akan disimpan dengan aman dan hanya digunakan untuk keperluan pendaftaran
        </p>
      </div>
    </div>
  );
};

export default VisitorRegistrationForm;
