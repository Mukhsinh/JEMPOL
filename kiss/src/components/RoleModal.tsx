import React, { useState, useEffect } from 'react';

interface Role {
  id?: string;
  name: string;
  code: string;
  description: string;
  permissions: any;
  is_system_role?: boolean;
  is_active?: boolean;
}

interface RoleFormData {
  name: string;
  code: string;
  description: string;
  permissions: any;
  is_system_role?: boolean;
  is_active?: boolean;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: RoleFormData) => void;
  role?: Role | null;
  mode: 'create' | 'edit';
}

const AVAILABLE_PERMISSIONS = [
  { key: 'tickets.read', label: 'Melihat Tiket', category: 'Tiket' },
  { key: 'tickets.create', label: 'Membuat Tiket', category: 'Tiket' },
  { key: 'tickets.update', label: 'Mengupdate Tiket', category: 'Tiket' },
  { key: 'tickets.delete', label: 'Menghapus Tiket', category: 'Tiket' },
  { key: 'tickets.assign', label: 'Assign Tiket', category: 'Tiket' },
  { key: 'tickets.escalate', label: 'Eskalasi Tiket', category: 'Tiket' },
  { key: 'reports.read', label: 'Melihat Laporan', category: 'Laporan' },
  { key: 'reports.export', label: 'Export Laporan', category: 'Laporan' },
  { key: 'users.read', label: 'Melihat Pengguna', category: 'Pengguna' },
  { key: 'users.create', label: 'Membuat Pengguna', category: 'Pengguna' },
  { key: 'users.update', label: 'Mengupdate Pengguna', category: 'Pengguna' },
  { key: 'users.delete', label: 'Menghapus Pengguna', category: 'Pengguna' },
  { key: 'settings.read', label: 'Melihat Pengaturan', category: 'Pengaturan' },
  { key: 'settings.update', label: 'Mengubah Pengaturan', category: 'Pengaturan' },
  { key: 'master_data.read', label: 'Melihat Master Data', category: 'Master Data' },
  { key: 'master_data.create', label: 'Membuat Master Data', category: 'Master Data' },
  { key: 'master_data.update', label: 'Mengupdate Master Data', category: 'Master Data' },
  { key: 'master_data.delete', label: 'Menghapus Master Data', category: 'Master Data' },
];

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSave, role, mode }) => {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    code: '',
    description: '',
    permissions: {},
    is_active: true
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [hasAllPermissions, setHasAllPermissions] = useState(false);

  useEffect(() => {
    if (role && mode === 'edit') {
      setFormData({
        name: role.name,
        code: role.code,
        description: role.description,
        permissions: role.permissions || {},
        is_system_role: role.is_system_role,
        is_active: role.is_active ?? true
      });
      
      // Check if has all permissions
      if (role.permissions?.all) {
        setHasAllPermissions(true);
        setSelectedPermissions([]);
      } else {
        setHasAllPermissions(false);
        // Extract selected permissions from role.permissions object
        const selected: string[] = [];
        Object.keys(role.permissions || {}).forEach(key => {
          if (role.permissions[key] === true) {
            selected.push(key);
          }
        });
        setSelectedPermissions(selected);
      }
    } else {
      // Reset for create mode
      setFormData({
        name: '',
        code: '',
        description: '',
        permissions: {},
        is_active: true
      });
      setSelectedPermissions([]);
      setHasAllPermissions(false);
    }
  }, [role, mode, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: RoleFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionToggle = (permissionKey: string) => {
    if (hasAllPermissions) return; // Can't toggle individual permissions when "all" is selected
    
    setSelectedPermissions(prev => {
      if (prev.includes(permissionKey)) {
        return prev.filter(p => p !== permissionKey);
      } else {
        return [...prev, permissionKey];
      }
    });
  };

  const handleAllPermissionsToggle = () => {
    setHasAllPermissions(!hasAllPermissions);
    if (!hasAllPermissions) {
      setSelectedPermissions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build permissions object
    let permissions = {};
    if (hasAllPermissions) {
      permissions = { all: true };
    } else {
      selectedPermissions.forEach(key => {
        permissions = { ...permissions, [key]: true };
      });
    }

    const roleData: RoleFormData = {
      ...formData,
      permissions,
      code: formData.code.toUpperCase()
    };

    onSave(roleData);
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === 'create' ? 'Tambah Peran Baru' : 'Edit Peran'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nama Peran *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="Masukkan nama peran"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kode Peran *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="Masukkan kode peran (contoh: STAFF)"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="Masukkan deskripsi peran"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Hak Akses
            </label>
            
            {/* All Permissions Toggle */}
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={hasAllPermissions}
                  onChange={handleAllPermissionsToggle}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <div>
                  <span className="font-medium text-slate-900 dark:text-white">Semua Hak Akses</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Memberikan akses penuh ke semua fitur sistem
                  </p>
                </div>
              </label>
            </div>

            {/* Individual Permissions */}
            {!hasAllPermissions && (
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <label key={permission.key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.key)}
                            onChange={() => handlePermissionToggle(permission.key)}
                            className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {permission.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {mode === 'create' ? 'Tambah Peran' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;