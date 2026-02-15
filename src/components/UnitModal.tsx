import React, { useState, useEffect } from 'react';
import { Unit, UnitType } from '../services/unitService';

interface UnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (unit: Partial<Unit>) => Promise<void>;
    unit?: Unit | null;
    units: Unit[];
    unitTypes: UnitType[];
}

const UnitModal: React.FC<UnitModalProps> = ({
    isOpen,
    onClose,
    onSave,
    unit,
    units,
    unitTypes
}) => {
    const [formData, setFormData] = useState<Partial<Unit>>({
        name: '',
        code: '',
        description: '',
        unit_type_id: '',
        parent_unit_id: '',
        contact_email: '',
        contact_phone: '',
        sla_hours: 24,
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (unit) {
            setFormData({
                name: unit.name || '',
                code: unit.code || '',
                description: unit.description || '',
                unit_type_id: unit.unit_type_id || '',
                parent_unit_id: unit.parent_unit_id || '',
                contact_email: unit.contact_email || '',
                contact_phone: unit.contact_phone || '',
                sla_hours: unit.sla_hours || 24,
                is_active: unit.is_active ?? true
            });
        } else {
            setFormData({
                name: '',
                code: '',
                description: '',
                unit_type_id: '',
                parent_unit_id: '',
                contact_email: '',
                contact_phone: '',
                sla_hours: 24,
                is_active: true
            });
        }
        setErrors({});
    }, [unit, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Nama unit wajib diisi';
        }

        if (!formData.code?.trim()) {
            newErrors.code = 'Kode unit wajib diisi';
        } else if (formData.code.length < 2) {
            newErrors.code = 'Kode unit minimal 2 karakter';
        }

        if (formData.sla_hours && (formData.sla_hours < 1 || formData.sla_hours > 168)) {
            newErrors.sla_hours = 'SLA harus antara 1-168 jam';
        }

        if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
            newErrors.contact_email = 'Format email tidak valid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving unit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof Unit, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Filter parent units (exclude current unit and its children)
    const availableParentUnits = units.filter(u => 
        u.id !== unit?.id && 
        u.parent_unit_id !== unit?.id &&
        u.is_active
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {unit ? 'Edit Unit Kerja' : 'Tambah Unit Kerja Baru'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nama Unit */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nama Unit <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                                    errors.name ? 'border-red-500' : 'border-slate-300'
                                }`}
                                placeholder="Masukkan nama unit kerja"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Kode Unit */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Kode Unit <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.code || ''}
                                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                                    errors.code ? 'border-red-500' : 'border-slate-300'
                                }`}
                                placeholder="Contoh: ADM, IGD"
                            />
                            {errors.code && (
                                <p className="mt-1 text-sm text-red-500">{errors.code}</p>
                            )}
                        </div>

                        {/* Tipe Unit */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Tipe Unit
                            </label>
                            <select
                                value={formData.unit_type_id || ''}
                                onChange={(e) => handleInputChange('unit_type_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Pilih tipe unit</option>
                                {unitTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Parent Unit */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Unit Induk
                            </label>
                            <select
                                value={formData.parent_unit_id || ''}
                                onChange={(e) => handleInputChange('parent_unit_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Tidak ada (Unit utama)</option>
                                {availableParentUnits.map(parentUnit => (
                                    <option key={parentUnit.id} value={parentUnit.id}>
                                        {parentUnit.name} ({parentUnit.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* SLA Hours */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Target SLA (Jam)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="168"
                                value={formData.sla_hours || 24}
                                onChange={(e) => handleInputChange('sla_hours', parseInt(e.target.value))}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                                    errors.sla_hours ? 'border-red-500' : 'border-slate-300'
                                }`}
                            />
                            {errors.sla_hours && (
                                <p className="mt-1 text-sm text-red-500">{errors.sla_hours}</p>
                            )}
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Deskripsi
                        </label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                            placeholder="Deskripsi unit kerja (opsional)"
                        />
                    </div>

                    {/* Kontak */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email Kontak
                            </label>
                            <input
                                type="email"
                                value={formData.contact_email || ''}
                                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                                    errors.contact_email ? 'border-red-500' : 'border-slate-300'
                                }`}
                                placeholder="email@example.com"
                            />
                            {errors.contact_email && (
                                <p className="mt-1 text-sm text-red-500">{errors.contact_email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Telepon Kontak
                            </label>
                            <input
                                type="tel"
                                value={formData.contact_phone || ''}
                                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                                placeholder="021-1234567"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formData.is_active ?? true}
                                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Unit aktif dan dapat menerima tiket
                            </span>
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            {unit ? 'Perbarui' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UnitModal;