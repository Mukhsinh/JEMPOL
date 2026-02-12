import React from 'react';
import { ServiceCategories } from '../settings/ServiceCategories';

const ServiceCategoriesPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kategori Layanan</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Kelola kategori layanan yang tersedia dalam sistem
                    </p>
                </div>
            </div>
            <ServiceCategories />
        </div>
    );
};

export default ServiceCategoriesPage;