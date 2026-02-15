import { useEffect, useState } from 'react';
import { complaintService } from '../services/complaintService';

interface StatusChartProps {
    metrics?: any;
}

interface ChartDataItem {
    name: string;
    count: number;
    percentage: number;
}

const StatusChart: React.FC<StatusChartProps> = ({ metrics }) => {
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            console.log('📊 StatusChart: Fetching chart data...');
            setLoading(true);
            
            try {
                // If metrics with categoryStats is provided, use it
                if (metrics?.categoryStats) {
                    const categoryData = Object.entries(metrics.categoryStats).map(([name, count]) => ({
                        name,
                        count: count as number,
                        percentage: 0 // Will be calculated below
                    }));
                    
                    const totalCount = categoryData.reduce((sum, item) => sum + item.count, 0);
                    const dataWithPercentage = categoryData.map(item => ({
                        ...item,
                        percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0
                    }));
                    
                    setChartData(dataWithPercentage.sort((a, b) => b.count - a.count).slice(0, 6));
                    setLoading(false);
                    return;
                }

                // Fallback to fetching data directly with timeout
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Chart data timeout')), 20000);
                });

                const dataPromise = Promise.all([
                    complaintService.getUnits(),
                    complaintService.getTickets({ limit: 1000 })
                ]);

                const [unitsResponse, ticketsResponse] = await Promise.race([dataPromise, timeoutPromise]) as [any, any];

                if (unitsResponse.success && ticketsResponse.success) {
                    const units = unitsResponse.data || [];
                    const tickets = ticketsResponse.data || [];

                    // Group tickets by unit
                    const unitTicketCounts = units.map((unit: any) => {
                        const unitTickets = tickets.filter((ticket: any) => ticket.unit_id === unit.id);
                        return {
                            name: unit.name,
                            count: unitTickets.length,
                            percentage: tickets.length > 0 ? (unitTickets.length / tickets.length) * 100 : 0
                        };
                    });

                    // Sort by count and take top 6
                    const topUnits = unitTicketCounts
                        .sort((a: ChartDataItem, b: ChartDataItem) => b.count - a.count)
                        .slice(0, 6);

                    setChartData(topUnits);
                }
            } catch (error) {
                console.error('❌ StatusChart: Error fetching chart data:', error);
                // Set empty data on error
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [metrics]);

    const maxCount = Math.max(...chartData.map(item => item.count), 1);

    return (
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {metrics?.categoryStats ? 'Tiket berdasarkan Kategori' : 'Tiket berdasarkan Unit'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Volume di seluruh departemen</p>
                </div>
                <button className="text-primary text-sm font-medium hover:underline">Lihat Laporan</button>
            </div>
            
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Memuat data grafik...</p>
                    </div>
                </div>
            ) : chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada data tersedia</p>
                </div>
            ) : (
                <div className="h-64 flex flex-col justify-end">
                    <div className="flex items-end justify-around h-full gap-3 px-2">
                        {chartData.map((item, index) => {
                            // Hitung tinggi batang secara proporsional berdasarkan nilai maksimum
                            // Minimal 10% agar batang tetap terlihat meskipun nilainya kecil
                            const heightPercent = maxCount > 0 ? Math.max((item.count / maxCount) * 100, 10) : 10;
                            
                            const barColors = [
                                'bg-blue-500 hover:bg-blue-600',
                                'bg-emerald-500 hover:bg-emerald-600',
                                'bg-purple-500 hover:bg-purple-600',
                                'bg-orange-500 hover:bg-orange-600',
                                'bg-pink-500 hover:bg-pink-600',
                                'bg-cyan-500 hover:bg-cyan-600'
                            ];
                            return (
                                <div key={index} className="flex flex-col items-center gap-2 flex-1 max-w-[80px] group">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {item.count}
                                    </span>
                                    <div 
                                        className={`w-full rounded-t-md ${barColors[index % barColors.length]} transition-all duration-500 cursor-pointer relative min-h-[20px]`}
                                        style={{ 
                                            height: `${heightPercent}%`
                                        }}
                                        title={`${item.name}: ${item.count} tiket`}
                                    >
                                        {item.count > 0 && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {item.count} Tiket
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center truncate w-full" title={item.name}>
                                        {item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusChart;