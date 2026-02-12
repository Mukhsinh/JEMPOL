import React from 'react';

interface KPICardProps {
    title: string;
    value: string;
    icon: string;
    trend: string;
    trendDirection: 'up' | 'down';
    trendColor: 'emerald' | 'red';
    iconBgColor: string;
    iconColor: string;
    subValue?: string;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon,
    trend,
    trendDirection,
    trendColor,
    iconBgColor,
    iconColor,
    subValue
}) => {
    return (
        <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex justify-between items-start">
                <div className={`p-2 ${iconBgColor} rounded-lg`}>
                    <span className={`material-symbols-outlined ${iconColor} text-2xl`}>{icon}</span>
                </div>
                <span className={`flex items-center text-${trendColor}-600 dark:text-${trendColor}-400 text-sm font-medium bg-${trendColor}-50 dark:bg-${trendColor}-900/20 px-2 py-0.5 rounded-full`}>
                    <span className="material-symbols-outlined text-[16px] mr-1">
                        {trendDirection === 'up' ? 'trending_up' : 'trending_down'}
                    </span>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
                    {subValue && <span className="text-sm text-slate-400">{subValue}</span>}
                </div>
            </div>
        </div>
    );
};

export default KPICard;
