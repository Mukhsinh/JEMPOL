import React, { useState, useEffect } from 'react';
import { SLASetting, CreateSLASettingData } from '../services/slaService';
import { masterDataService } from '../services/masterDataService';

interface SLASettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSLASettingData) => void;
  slaSetting?: SLASetting | null;
  title: string;
}

interface UnitType {
  id: string;
  name: string;
  code: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  code: string;
}

interface PatientType {
  id: string;
  name: string;
  code: string;
}

const SLASettingModal: React.FC<SLASettingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  slaSetting,
  title
}) => {
  const [formData, setFormData] = useState<CreateSLASettingData>({
    name: '',
    unit_type_id: '',
    service_category_id: '',
    patient_type_id: '',
    priority_level: 'medium',
    response_time_hours: 1,
    resolution_time_hours: 24,
    escalation_time_hours: 48,
    business_hours_only: false,
    is_active: true
  });

  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [patientTypes, setPatientTypes] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReferenceData();
      if (slaSetting) {
        setFormData({
          name: slaSetting.name,
          unit_type_id: slaSetting.unit_type_id || '',
          service_category_id: slaSetting.service_category_id || '',
          patient_type_id: slaSetting.patient_type_id || '',
          priority_level: slaSetting.priority_level || 'medium',
          response_time_hours: slaSetting.response_time_hours,
          resolution_time_hours: slaSetting.resolution_time_hours,
          escalation_time_hours: slaSetting.escalation_time_hours || 48,
          business_hours_only: slaSetting.business_hours_only,
          is_active: slaSetting.is_active
        });
      } else {
        setFormData({
          name: '',
          unit_type_id: '',
          service_category_id: '',
          patient_type_id: '',
          priority_level: 'medium',
          response_time_hours: 1,
          resolution_time_hours: 24,
          escalation_time_hours: 48,
          business_hours_only: false,
          is_active: true
        });
      }
    }
  }, [isOpen, slaSetting]);

  const loadReferenceData = async () => {
    try {
      const [unitTypesData, serviceCategoriesData, patientTypesData] = await Promise.all([
        masterDataService.getUnitTypes(),
        masterDataService.getServiceCategories(),
        masterDataService.getPatientTypes()
      ]);
      
      setUnitTypes(unitTypesData);
      setServiceCategories(serviceCategoriesData);
      setPatientTypes(patientTypesData);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        unit_type_id: formData.unit_type_id || undefined,
        service_category_id: formData.service_category_id || undefined,
        patient_type_id: formData.patient_type_id || undefined,
        escalation_time_hours: formData.escalation_time_hours || undefined
      };
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving SLA setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: CreateSLASettingData) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nama Pengaturan SLA *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="Masukkan nama pengaturan SLA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tipe Unit
              </label>
              <select
                name="unit_type_id"
                value={formData.unit_type_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="">Pilih Tipe Unit</option>
                {unitTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kategori Layanan
              </label>
              <select
                name="service_category_id"
                value={formData.service_category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="">Pilih Kategori Layanan</option>
                {serviceCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tipe Pasien
              </label>
              <select
                name="patient_type_id"
                value={formData.patient_type_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="">Pilih Tipe Pasien</option>
                {patientTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Level Prioritas
              </label>
              <select
                name="priority_level"
                value={formData.priority_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
                <option value="critical">Kritis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Waktu Respon (Jam) *
              </label>
              <input
                type="number"
                name="response_time_hours"
                value={formData.response_time_hours}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Waktu Penyelesaian (Jam) *
              </label>
              <input
                type="number"
                name="resolution_time_hours"
                value={formData.resolution_time_hours}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Waktu Eskalasi (Jam)
              </label>
              <input
                type="number"
                name="escalation_time_hours"
                value={formData.escalation_time_hours}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="business_hours_only"
                  checked={formData.business_hours_only}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
                <label className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Hanya berlaku pada jam kerja
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
                <label className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Aktif
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SLASettingModal;