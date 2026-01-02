import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MasterData: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect ke halaman Unit Kerja sebagai default
        navigate('/master-data/units', { replace: true });
    }, [navigate]);

    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Memuat Master Data...</p>
            </div>
        </div>
    );
};

export default MasterData;