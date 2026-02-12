import React, { useState, useEffect } from 'react';
import RoleModal from '../../components/RoleModal';
import { roleService, Role as RoleType } from '../../services/roleService';

type RoleFormData = {
  name: string;
  code: string;
  description: string;
  permissions: any;
  is_system_role?: boolean;
  is_active?: boolean;
};

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Fetch roles from database
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Gagal memuat data peran dari server');
      
      // Fallback: use existing data
      const fallbackRoles: RoleType[] = [
        {
          id: 'aa5687ff-8ed3-40d0-bc83-db052b72e481',
          name: 'Administrator',
          code: 'ADMIN',
          description: 'Administrator sistem dengan akses penuh',
          permissions: { all: true },
          is_system_role: true,
          is_active: true,
          created_at: '2025-12-30T23:03:39.527264Z',
          updated_at: '2025-12-30T23:03:39.527264Z'
        },
        {
          id: '38eb526f-e29c-424e-a613-2bc16bb2ec7f',
          name: 'Supervisor',
          code: 'SUPERVISOR',
          description: 'Supervisor unit dengan akses manajemen',
          permissions: { 
            manage_unit: true,
            view_reports: true
          },
          is_system_role: false,
          is_active: true,
          created_at: '2025-12-30T23:03:39.527264Z',
          updated_at: '2025-12-30T23:03:39.527264Z'
        },
        {
          id: '75d38d48-5aaf-4014-b910-debf9f34d1fd',
          name: 'Staff',
          code: 'STAFF',
          description: 'Staff operasional',
          permissions: { 
            create_ticket: true,
            respond_ticket: true
          },
          is_system_role: false,
          is_active: true,
          created_at: '2025-12-30T23:03:39.527264Z',
          updated_at: '2025-12-30T23:03:39.527264Z'
        },
        {
          id: 'ddf6228b-2c10-4ff6-b980-c73fbe765744',
          name: 'Manager',
          code: 'MANAGER',
          description: 'Manager dengan akses luas',
          permissions: { 
            escalate: true,
            manage_unit: true,
            view_reports: true
          },
          is_system_role: false,
          is_active: true,
          created_at: '2025-12-30T23:03:39.527264Z',
          updated_at: '2025-12-30T23:03:39.527264Z'
        }
      ];
      setRoles(fallbackRoles);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    
    // Mock permissions data
    const mockPermissions: Permission[] = [
      { id: '1', name: 'tickets.read', description: 'Melihat tiket', category: 'Tiket' },
      { id: '2', name: 'tickets.write', description: 'Membuat tiket', category: 'Tiket' },
      { id: '3', name: 'tickets.update', description: 'Mengupdate tiket', category: 'Tiket' },
      { id: '4', name: 'tickets.delete', description: 'Menghapus tiket', category: 'Tiket' },
      { id: '5', name: 'reports.read', description: 'Melihat laporan', category: 'Laporan' },
      { id: '6', name: 'users.manage', description: 'Mengelola pengguna', category: 'Pengguna' },
      { id: '7', name: 'settings.manage', description: 'Mengelola pengaturan', category: 'Pengaturan' }
    ];
    setPermissions(mockPermissions);
  }, []);

  const handleCreateRole = () => {
    setSelectedRole(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditRole = (role: RoleType) => {
    if (role.is_system_role) {
      alert('Peran sistem tidak dapat diedit');
      return;
    }
    setSelectedRole(role);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewUsers = async (roleId: string, roleName: string) => {
    try {
      const users = await roleService.getUsersByRole(roleId);

      if (users.length === 0) {
        alert(`Tidak ada pengguna yang menggunakan peran "${roleName}"`);
      } else {
        const userList = users.map((user: any) => 
          `- ${user.full_name} (${user.email})`
        ).join('\n');
        alert(`Pengguna dengan peran "${roleName}" (${users.length} orang):\n\n${userList}`);
      }
    } catch (err) {
      console.error('Error fetching users by role:', err);
      alert('Gagal memuat data pengguna');
    }
  };

  const handleSaveRole = async (roleData: RoleFormData) => {
    try {
      if (modalMode === 'create') {
        await roleService.createRole(roleData);
      } else {
        await roleService.updateRole(selectedRole?.id || '', roleData);
      }

      await fetchRoles(); // Refresh the list
      alert(`Peran berhasil ${modalMode === 'create' ? 'dibuat' : 'diupdate'}`);
    } catch (err) {
      console.error(`Error ${modalMode} role:`, err);
      alert(err instanceof Error ? err.message : `Gagal ${modalMode === 'create' ? 'membuat' : 'mengupdate'} peran`);
      throw err; // Re-throw to prevent modal from closing
    }
  };

  const handleDelete = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    if (role.is_system_role) {
      alert('Peran sistem tidak dapat dihapus');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus peran "${role.name}"?`)) {
      try {
        await roleService.deleteRole(roleId);
        setRoles(roles.filter(role => role.id !== roleId));
        alert('Peran berhasil dihapus');
      } catch (err) {
        console.error('Error deleting role:', err);
        alert(err instanceof Error ? err.message : 'Gagal menghapus peran');
      }
    }
  };

  const handleToggleStatus = async (roleId: string) => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      await roleService.updateRole(roleId, {
        is_active: !role.is_active
      });

      setRoles(roles.map(r => 
        r.id === roleId ? { ...r, is_active: !r.is_active } : r
      ));
    } catch (err) {
      console.error('Error updating role status:', err);
      alert(err instanceof Error ? err.message : 'Gagal mengubah status peran');
    }
  };

  const renderPermissionBadges = (permissions: any) => {
    if (!permissions || typeof permissions !== 'object') {
      return <span className="text-xs text-slate-500">Tidak ada akses</span>;
    }

    if (permissions.all) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
          Semua Akses
        </span>
      );
    }

    const permissionKeys = Object.keys(permissions);
    const displayKeys = permissionKeys.slice(0, 2);
    
    return (
      <div className="flex flex-wrap gap-1">
        {displayKeys.map((key, index) => (
          <span key={index} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
            {key}
          </span>
        ))}
        {permissionKeys.length > 2 && (
          <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
            +{permissionKeys.length - 2} lainnya
          </span>
        )}
      </div>
    );
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
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
          onClick={handleCreateRole}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Peran
        </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">group</span>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Peran</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{roles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Peran Aktif</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {roles.filter(role => role.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">security</span>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Hak Akses</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{permissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daftar Peran</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Nama Peran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Hak Akses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <span className="material-symbols-outlined text-primary text-sm">badge</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {role.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {role.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {role.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {renderPermissionBadges(role.permissions)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(role.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.is_active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {role.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewUsers(role.id, role.name)}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        title="Lihat pengguna dengan peran ini"
                      >
                        <span className="material-symbols-outlined text-sm">group</span>
                      </button>
                      <button
                        onClick={() => handleEditRole(role)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={role.is_system_role}
                        title={role.is_system_role ? 'Peran sistem tidak dapat diedit' : 'Edit peran'}
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={role.is_system_role}
                        title={role.is_system_role ? 'Peran sistem tidak dapat dihapus' : 'Hapus peran'}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
        role={selectedRole}
        mode={modalMode}
      />
    </div>
  );
};

export default RolesPermissions;