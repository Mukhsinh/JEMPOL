import React, { useState, useEffect } from 'react';
import slaService from '../services/slaService';

const SLASettingsSimple: React.FC = () => {
    const [slaSettings, setSlaSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSLASettings();
    }, []);

    const loadSLASettings = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Loading SLA settings...');
            const data = await slaService.getSLASettings();
            console.log('SLA settings loaded:', data);
            setSlaSettings(data);
        } catch (err: any) {
            console.error('Error loading SLA settings:', err);
            setError(err.message || 'Gagal memuat pengaturan SLA');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div>Loading SLA Settings...</div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Memuat data dari API...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
                <h3 style={{ color: '#d32f2f', margin: '0 0 10px 0' }}>Error</h3>
                <p style={{ color: '#d32f2f', margin: 0 }}>{error}</p>
                <button 
                    onClick={loadSLASettings}
                    style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px', 
                        backgroundColor: '#2196f3', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>SLA Settings ({slaSettings.length} items)</h2>
                <button 
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#4caf50', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    + Tambah SLA
                </button>
            </div>

            {slaSettings.length === 0 ? (
                <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '8px' 
                }}>
                    <h3>Belum ada pengaturan SLA</h3>
                    <p>Mulai dengan menambahkan pengaturan SLA pertama Anda</p>
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f5f5f5' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nama</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Prioritas</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Waktu Respon</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slaSettings.map((sla, index) => (
                                <tr key={sla.id || index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>
                                        <strong>{sla.name}</strong>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '12px',
                                            backgroundColor: getPriorityColor(sla.priority_level),
                                            color: 'white'
                                        }}>
                                            {getPriorityLabel(sla.priority_level)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {sla.response_time_hours}h
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '12px',
                                            backgroundColor: sla.is_active ? '#4caf50' : '#9e9e9e',
                                            color: 'white'
                                        }}>
                                            {sla.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        <button style={{ 
                                            marginRight: '4px', 
                                            padding: '1px 4px', 
                                            backgroundColor: '#2196f3', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '2px',
                                            cursor: 'pointer',
                                            fontSize: '10px',
                                            minWidth: '32px',
                                            height: '20px'
                                        }}>
                                            Edit
                                        </button>
                                        <button style={{ 
                                            padding: '1px 4px', 
                                            backgroundColor: '#f44336', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '2px',
                                            cursor: 'pointer',
                                            fontSize: '10px',
                                            minWidth: '32px',
                                            height: '20px'
                                        }}>
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

function getPriorityColor(priority: string): string {
    switch (priority) {
        case 'low': return '#4caf50';
        case 'medium': return '#ff9800';
        case 'high': return '#ff5722';
        case 'critical': return '#f44336';
        default: return '#9e9e9e';
    }
}

function getPriorityLabel(priority: string): string {
    switch (priority) {
        case 'low': return 'Rendah';
        case 'medium': return 'Sedang';
        case 'high': return 'Tinggi';
        case 'critical': return 'Kritis';
        default: return priority;
    }
}

export default SLASettingsSimple;