import React from 'react';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200">
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-full relative">
                <div className="max-w-[1400px] mx-auto p-6 md:p-8 flex flex-col gap-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
