import { useEffect, useState, useRef } from 'react';
import userService, { User, Unit, CreateUserData, UpdateUserData } from '../../services/userService';

interface UserWithUnit extends User {
    units?: Unit;
}

interface UserFormData {
    full_name: string;
    email: string;
    employee_id: string;
    phone: string;
    unit_id: string;
    role: 'staff' | 'supervisor' | 'manager' | 'director' | 'admin';
    password?: string;
}

const UserManagement = () => {
    const [users, setUsers] = useState<UserWithUnit[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [unitFilter, setUnitFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserWithUnit | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        full_name: '',
        email: '',
        employee_id: '',
        phone: '',
        unit_id: '',
        role: 'staff',
        password: ''
    });
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersData, unitsData] = await Promise.all([
                userService.getUsers(),
                userService.getUnits()
            ]);

            const usersWithUnits: UserWithUnit[] = usersData.map(user => ({
                ...user,
                units: user.units ? {
                    ...user.units,
                    is_active: true
                } : undefined
            }));

            setUsers(usersWithUnits);
            setUnits(unitsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Gagal memuat data pengguna.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi unduh template CSV
    const handleDownloadTemplate = () => {
        const headers = ['full_name', 'email', 'employee_id', 'phone', 'unit_id', 'role', 'password'];
        const exampleRow = ['John Doe', 'john@example.com', 'EMP001', '081234567890', '', 'staff', 'password123'];
        
        const csvContent = [
            headers.join(','),
            exampleRow.join(','),
            '# Catatan:',
            '# - full_name: Nama lengkap pengguna (wajib)',
            '# - email: Email pengguna (wajib, harus unik)',
            '# - employee_id: NIP/ID karyawan (opsional)',
            '# - phone: Nomor telepon (opsional)',
            '# - unit_id: ID unit kerja (opsional, kosongkan jika tidak ada)',
            '# - role: Peran pengguna (staff/supervisor/manager/director/admin)',
            '# - password: Password untuk login (opsional)'
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'template_pengguna.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Fungsi import data dari CSV
    const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                
                if (lines.length < 2) {
                    alert('File CSV kosong atau tidak valid.');
                    setIsImporting(false);
                    return;
                }

                const headers = lines[0].split(',').map(h => h.trim());
                const dataLines = lines.slice(1);

                let successCount = 0;
                let errorCount = 0;
                const errors: string[] = [];

                for (let i = 0; i < dataLines.length; i++) {
                    const values = dataLines[i].split(',').map(v => v.trim());
                    const userData: any = {};

                    headers.forEach((header, index) => {
                        userData[header] = values[index] || undefined;
                    });

                    try {
                        const createData: CreateUserData = {
                            full_name: userData.full_name,
                            email: userData.email,
                            employee_id: userData.employee_id || undefined,
                            phone: userData.phone || undefined,
                            unit_id: userData.unit_id || undefined,
                            role: userData.role || 'staff',
                            password: userData.password || undefined,
                            create_admin_account: !!userData.password
                        };

                        await userService.createUser(createData);
                        successCount++;
                    } catch (error) {
                        errorCount++;
                        errors.push(`Baris ${i + 2}: ${(error as Error).message}`);
                    }
                }

                alert(`Import selesai!\nBerhasil: ${successCount}\nGagal: ${errorCount}${errors.length > 0 ? '\n\nError:\n' + errors.slice(0, 5).join('\n') : ''}`);
                fetchData();
            } catch (error) {
                console.error('Error importing data:', error);
                alert('Gagal mengimpor data: ' + (error as Error).message);
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };

        reader.readAsText(file);
    };

    const handleAddUser = async () => {
        try {
            const userData: CreateUserData = {
                full_name: formData.full_name,
                email: formData.email,
                employee_id: formData.employee_id || undefined,
                phone: formData.phone || undefined,
                unit_id: formData.unit_id || undefined,
                role: formData.role,
                password: formData.password,
                create_admin_account: !!formData.password
            };

            await userService.createUser(userData);
            alert('Pengguna berhasil ditambahkan.');
            setShowAddModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Gagal menambahkan pengguna: ' + (error as Error).message);
        }
    };

    const handleEditUser = async () => {
        if (!editingUser) return;

        try {
            const userData: UpdateUserData = {
                full_name: formData.full_name,
                email: formData.email,
                employee_id: formData.employee_id || undefined,
                phone: formData.phone || undefined,
                unit_id: formData.unit_id || undefined,
                role: formData.role,
                password: formData.password,
                update_admin_password: !!formData.password
            };

            await userService.updateUser(editingUser.id, userData);
            alert('Pengguna berhasil diperbarui.');
            setShowEditModal(false);
            setEditingUser(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Gagal memperbarui pengguna: ' + (error as Error).message);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Apakah Anda yakin ingin menonaktifkan pengguna ini?')) return;

        try {
            await userService.deleteUser(userId);
            alert('Pengguna berhasil dinonaktifkan.');
            fetchData();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Gagal menonaktifkan pengguna.');
        }
    };

    const openEditModal = (user: UserWithUnit) => {
        setEditingUser(user);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            employee_id: user.employee_id || '',
            phone: user.phone || '',
            unit_id: user.unit_id || '',
            role: user.role as any,
            password: ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            employee_id: '',
            phone: '',
            unit_id: '',
            role: 'staff',
            password: ''
        });
    };

    // Filtering
    const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
        const matchesSearch =
            user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.employee_id && user.employee_id.includes(searchQuery));

        const matchesRole = roleFilter ? user.role === roleFilter : true;
        const matchesUnit = unitFilter ? user.unit_id === unitFilter : true;
        const matchesStatus = statusFilter ? (statusFilter === 'active' ? user.is_active : !user.is_active) : true;

        return matchesSearch && matchesRole && matchesUnit && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex flex-col h-full min-w-0 bg-background-light dark:bg-background-dark">
            {/* Scrollable Content Area */}
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:px-10 py-8">
                <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                    {/* Page Heading */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-text-main dark:text-white text-3xl font-black tracking-tight">Manajemen Pengguna</h1>
                        <p className="text-text-secondary dark:text-slate-400 text-base font-normal max-w-2xl">Kelola akses, peran, dan unit kerja pengguna dalam sistem penanganan keluhan.</p>
                    </div>

                    {/* Filters & Search Toolbar */}
                    <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-color dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1 min-w-[240px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-text-secondary dark:text-slate-400">search</span>
                            </div>
                            <input
                                className="block w-full pl-10 pr-3 py-2.5 border border-border-color dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-text-secondary dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-shadow"
                                placeholder="Cari nama, email, atau NIP..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative min-w-[140px]">
                                <select
                                    className="block w-full pl-3 pr-10 py-2.5 text-sm border border-border-color dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="">Semua Peran</option>
                                    <option value="staff">Staff</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="manager">Manager</option>
                                    <option value="director">Director</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <span className="material-symbols-outlined text-text-secondary dark:text-slate-400 text-sm">expand_more</span>
                                </div>
                            </div>
                            <div className="relative min-w-[140px]">
                                <select
                                    className="block w-full pl-3 pr-10 py-2.5 text-sm border border-border-color dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                                    value={unitFilter}
                                    onChange={(e) => setUnitFilter(e.target.value)}
                                >
                                    <option value="">Semua Unit</option>
                                    {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <span className="material-symbols-outlined text-text-secondary dark:text-slate-400 text-sm">expand_more</span>
                                </div>
                            </div>
                            <div className="relative min-w-[140px]">
                                <select
                                    className="block w-full pl-3 pr-10 py-2.5 text-sm border border-border-color dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Status</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <span className="material-symbols-outlined text-text-secondary dark:text-slate-400 text-sm">expand_more</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setRoleFilter('');
                                    setUnitFilter('');
                                    setStatusFilter('');
                                }}
                                className="px-4 py-2.5 text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white font-medium text-sm border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons - Sejajar di atas tabel */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all font-bold text-sm whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            Unduh Template
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all font-bold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[20px]">upload</span>
                            {isImporting ? 'Mengimpor...' : 'Import Data'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleImportData}
                            className="hidden"
                        />
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg shadow-sm shadow-blue-200 dark:shadow-none transition-all font-bold text-sm whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Tambah Pengguna
                        </button>
                    </div>

                    {/* Data Table */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-color dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-border-color dark:border-slate-700 text-xs uppercase tracking-wider text-text-secondary dark:text-slate-400 font-bold">
                                        <th className="p-4 w-12 text-center">
                                            <input className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary/20 size-4 bg-white dark:bg-slate-700" type="checkbox" />
                                        </th>
                                        <th className="p-4 min-w-[250px]">Nama Pengguna</th>
                                        <th className="p-4 min-w-[200px]">Kontak / NIP</th>
                                        <th className="p-4">Peran</th>
                                        <th className="p-4">Unit Kerja</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color dark:divide-slate-700 text-sm">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-slate-500">Memuat data pengguna...</td>
                                        </tr>
                                    ) : paginatedUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-slate-500">Tidak ada pengguna ditemukan.</td>
                                        </tr>
                                    ) : (
                                        paginatedUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="p-4 text-center">
                                                    <input className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary/20 size-4 bg-white dark:bg-slate-700" type="checkbox" />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-primary rounded-full size-10 flex-shrink-0 flex items-center justify-center">
                                                            <span className="text-white font-bold text-sm">{user.full_name.charAt(0)}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-text-main dark:text-white">{user.full_name}</span>
                                                            <span className="text-xs text-text-secondary dark:text-slate-400">
                                                                {user.created_at ? `Bergabung: ${new Date(user.created_at).toLocaleDateString()}` : 'Baru bergabung'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-text-main dark:text-white">{user.email}</span>
                                                        {user.employee_id && <span className="text-xs text-text-secondary dark:text-slate-400">NIP: {user.employee_id}</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                        user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                                                        user.role === 'manager' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                                                        user.role === 'supervisor' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                                                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-text-main dark:text-white font-medium">
                                                    {user.units?.name || '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${user.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                        <span className={`font-medium text-xs px-2 py-0.5 rounded-md border ${
                                                            user.is_active
                                                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800'
                                                            : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                                                        }`}>
                                                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                                                            title="Edit"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-text-secondary dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                            title="Nonaktifkan"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">block</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="flex items-center justify-between p-4 border-t border-border-color dark:border-slate-700 bg-white dark:bg-surface-dark">
                            <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-slate-400">
                                <span>Menampilkan</span>
                                <span className="font-bold text-text-main dark:text-white">
                                    {filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                                </span>
                                <span>dari</span>
                                <span className="font-bold text-text-main dark:text-white">{filteredUsers.length}</span>
                                <span>pengguna</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="size-9 flex items-center justify-center rounded-lg border border-transparent text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-main dark:hover:text-white disabled:opacity-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`size-9 flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                                            currentPage === page
                                            ? 'bg-primary text-white shadow-sm shadow-blue-200 dark:shadow-none'
                                            : 'border border-transparent text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-main dark:hover:text-white'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="size-9 flex items-center justify-center rounded-lg border border-transparent text-text-secondary dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-main dark:hover:text-white disabled:opacity-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tambah Pengguna Baru</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="Masukkan email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">NIP</label>
                                <input
                                    type="text"
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="Masukkan NIP (opsional)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telepon</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="Masukkan nomor telepon"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Kerja</label>
                                <select
                                    value={formData.unit_id}
                                    onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Pilih Unit Kerja</option>
                                    {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Peran</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="manager">Manager</option>
                                    <option value="director">Director</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password (Opsional)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="Masukkan password untuk akses login"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddUser}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
                            >
                                Tambah Pengguna
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Pengguna</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">NIP</label>
                                <input
                                    type="text"
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telepon</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Kerja</label>
                                <select
                                    value={formData.unit_id}
                                    onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Pilih Unit Kerja</option>
                                    {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Peran</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="manager">Manager</option>
                                    <option value="director">Director</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password Baru (Opsional)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="Kosongkan jika tidak ingin mengubah password"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingUser(null);
                                    resetForm();
                                }}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleEditUser}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
