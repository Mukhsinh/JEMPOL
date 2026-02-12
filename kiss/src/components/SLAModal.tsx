import React, { useState, useEffect } from 'react';
import { SLASetting, CreateSLASettingData, UpdateSLASettingData } from '../services/slaService';
import slaService from '../services/slaService';

interface SLAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSLASettingData | UpdateSLASettingData) => void;
  sla?: SLASetting | null;
  mode: 'create' | 'edit';
}

interface DropdownData {
  unitTypes: Array<{id: string; name: string; code: string}>;
  serviceCategories: Array<{id: string; name: string; code: string}>;
  patientTypes: Array<{id: string; name: string; code: string}>;
}

const SLAModal: React.FC<SLAModalProps> = ({ isOpen, onClose, onSave, sla, mode }) => {
  const [formData, setFormData] = useState<CreateSLASettingData>({
    name: '',
    unit_type_id: '',
    service_category_id: '',
    patient_type_id: '',
    priority_level: 'medium',
    response_time_hours: 4,
    resolution_time_hours: 24,
    escalation_time_hours: 48,
    business_hours_only: true,
    is_active: true
  });

  const [dropdownData, setDropdownData] = useState<DropdownData>({
    unitTypes: [],
    serviceCategories: [],
    patientTypes: []
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      if (mode === 'edit' && sla) {
        setFormData({
          name: sla.name,
          unit_type_id: sla.unit_type_id || '',
          service_category_id: sla.service_category_id || '',
          patient_type_id: sla.patient_type_id || '',
          priority_level: sla.priority_level,
          response_time_hours: sla.response_time_hours,
          resolution_time_hours: sla.resolution_time_hours,
          escalation_time_hours: sla.escalation_time_hours || 48,
          business_hours_only: sla.business_hours_only,
          is_active: sla.is_active
        });
      } else {
        setFormData({
          name: '',
          unit_type_id: '',
          service_category_id: '',
          patient_type_id: '',
          priority_level: 'medium',
          response_time_hours: 4,
          resolution_time_hours: 24,
          escalation_time_hours: 48,
          business_hours_only: true,
          is_active: true
        });
      }
    }
  }, [isOpen, mode, sla]);

  const loadDropdownData = async () => {
    try {
      const [unitTypes, serviceCategories, patientTypes] = await Promise.all([
        slaService.getUnitTypes(),
        slaService.getServiceCategories(),
        slaService.getPatientTypes()
      ]);

      setDropdownData({
        unitTypes,
        serviceCategories,
        patientTypes
      });
    } catch (error) {
      console.error('Error loading dropdown data:', error);
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

      onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving SLA setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const priorityOptions = [
    { value: 'low', label: 'Rendah', color: 'text-green-600' },
    { value: 'medium', label: 'Sedang', color: 'text-yellow-600' },
    { value: 'high', label: 'Tinggi', color: 'text-orange-600' },
    { value: 'critical', label: 'Kritis', color: 'text-red-600' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {mode === 'create' ? 'Tambah Pengaturan SLA' : 'Edit Pengaturan SLA'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {dropdownData.unitTypes.map(type => (
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
                {dropdownData.serviceCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {dropdownData.patientTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Level Prioritas *
              </label>
              <select
                name="priority_level"
                value={formData.priority_level}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="business_hours_only"
                checked={formData.business_hours_only}
                onChange={handleChange}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                Hanya Jam Kerja
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                Aktif
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Menyimpan...' : (mode === 'create' ? 'Tambah' : 'Simpan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SLAModal;