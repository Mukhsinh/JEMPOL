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
                if (fileInputRef.c