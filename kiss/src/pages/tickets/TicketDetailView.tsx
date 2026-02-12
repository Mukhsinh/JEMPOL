

const TicketDetailView = () => {
    return (
        <div className="flex flex-col h-full min-w-0 bg-background-light dark:bg-background-dark">
            {/* Top Navbar - Adapted */}
            <header className="flex flex-none items-center justify-between whitespace-nowrap border-b border-solid border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#101922] px-6 py-3 z-20 rounded-t-xl">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="size-8 text-primary">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
                            </svg>
                        </div>
                        <h2 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">GovAssist CMS</h2>
                    </div>
                    <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                            <div className="text-[#4c739a] flex border-none bg-[#f0f4f8] dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#f0f4f8] dark:bg-slate-800 focus:border-none h-full placeholder:text-[#4c739a] px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" placeholder="Search tickets..." defaultValue="" />
                        </div>
                    </label>
                </div>
                <div className="flex flex-1 justify-end gap-6 md:gap-8 items-center">
                    <div className="hidden md:flex items-center gap-6">
                        <a className="text-[#0d141b] dark:text-slate-200 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Dashboard</a>
                        <a className="text-primary text-sm font-medium leading-normal" href="#">Tickets</a>
                        <a className="text-[#0d141b] dark:text-slate-200 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Reports</a>
                        <a className="text-[#0d141b] dark:text-slate-200 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Settings</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center justify-center text-[#4c739a] dark:text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="bg-center bg-no-repeat bg-cover rounded-full size-9 border-2 border-white dark:border-slate-700 shadow-sm cursor-pointer" data-alt="User profile avatar showing a professional in business attire" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBrbYkm9l-v9iHmYaen7iCX-2W8W0kg4LQkNVv-WG45JhvwqNk8x_cE5hlwNCeUDUgIBzlNFiAfFnPR5-hE7gUI3JpJaMt9ikSPo9Ldi0r0hSGKj16vZgQje_gf_qDv8CjtG0_h5Vx0Z-oONloCUhAUKHbTW79nJ0Mqi0MVbotMzkd9henNEcyjVza03zlzH3jn7LLi3Dn1ZapYvMVZqDPQ9HPxeScDcHhzjCjZBz8210GtNXJwvLHVTuN4qiz82d_L8GqdsTMRTUXA")' }}>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-20 scrollbar-hide">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <a className="text-[#4c739a] font-medium hover:text-primary transition-colors" href="#">Home</a>
                                <span className="material-symbols-outlined text-[#4c739a] text-[16px]">chevron_right</span>
                                <a className="text-[#4c739a] font-medium hover:text-primary transition-colors" href="#">Tickets</a>
                                <span className="material-symbols-outlined text-[#4c739a] text-[16px]">chevron_right</span>
                                <span className="text-[#0d141b] dark:text-white font-medium">Ticket #4920</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#e7edf3] dark:border-slate-800 pb-6">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                                        Ticket #4920: Sanitation Issue in Ward B
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#4c739a]">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">calendar_today</span> Created Oct 24, 2023 • 10:00 AM</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">apartment</span> Unit: Facilities Management</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                        <span>Resolve</span>
                                    </button>
                                    <button className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white text-sm font-bold rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">warning</span>
                                        <span>Escalate</span>
                                    </button>
                                    <button className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white text-sm font-bold rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                                        <span>Assign</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                <div className="bg-white dark:bg-slate-800 rounded-xl border-l-4 border-indigo-500 shadow-sm overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/30 dark:to-slate-800 px-6 py-4 border-b border-indigo-100 dark:border-slate-700 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-300">
                                                <span className="material-symbols-outlined text-[24px]">psychology</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">AI Analysis & Insights</h3>
                                                <p className="text-xs text-[#4c739a] dark:text-indigo-200">Powered by GovAI Engine v2.4</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">Analysis Complete</span>
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-5">
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-2">Classification Result</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        Complaint
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                                        High Urgency
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        Sanitation Unit
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-end mb-1">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#4c739a]">AI Confidence Score</h4>
                                                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">95%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                                    <div className="bg-indigo-500 h-3 rounded-full relative" style={{ width: '95%' }}>
                                                        <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-[#4c739a] mt-1.5 italic">High confidence based on image pattern matching and keyword density.</p>
                                            </div>
                                        </div>
                                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300">
                                                    <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                                                    <h4 className="text-sm font-bold">Recommended Actions</h4>
                                                </div>
                                                <ul className="space-y-2.5">
                                                    <li className="flex items-start gap-2 text-sm text-[#0d141b] dark:text-slate-200">
                                                        <span className="material-symbols-outlined text-[16px] text-indigo-500 mt-0.5">check_small</span>
                                                        <span>Dispatch cleaning crew immediately (SLA risk).</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-sm text-[#0d141b] dark:text-slate-200">
                                                        <span className="material-symbols-outlined text-[16px] text-indigo-500 mt-0.5">check_small</span>
                                                        <span>Follow-up call within 2 hours to confirm resolution.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-sm text-[#0d141b] dark:text-slate-200">
                                                        <span className="material-symbols-outlined text-[16px] text-indigo-500 mt-0.5">check_small</span>
                                                        <span>Log incident for weekly sanitation review.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-800/30 flex gap-2">
                                                <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 flex items-center gap-1 transition-colors">
                                                    Apply All Recommendations <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-[#0d141b] dark:text-white mb-4">Description</h3>
                                    <p className="text-[#4c739a] dark:text-slate-300 leading-relaxed mb-6">
                                        Patient reported overflowing bins in the main hallway of Ward B near the nurses' station. The smell is becoming noticeable and creating discomfort for visitors and patients in the waiting area. Several visitors have complained about the lack of timely cleaning. Attached photos show the condition as of 9:45 AM today.
                                    </p>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        <div className="flex-none w-32 h-32 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden relative group cursor-pointer border border-[#e7edf3] dark:border-slate-600">
                                            <div className="bg-cover bg-center w-full h-full hover:scale-105 transition-transform duration-300" data-alt="Photo of overflowing waste bin in a hospital corridor" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCA4CHH3a-NS7bVRvGht1TmBSQNBD0LTRgff88ppgrHzAkwbRrWBpPBotsT6pKxonmY_mkG7v-QRNbt7KkFL4LkInM6_RyeJNNFx5llGEZV7RZC9wfZwydw-TPIXe37doFJYJU33-nu5CLN8rC9uQvX8wh7nrAyi1r9kROdY6y9Q9vaoY5grOsg8askdvnrAu4xyc4HxIfN350Bzqi_-RxoXZmNbrKUJQ-laGW-yN86QZLHpvk5XAl_2Jv6ZHYGHpDh4GAFV28YHzGY')" }}>
                                            </div>
                                        </div>
                                        <div className="flex-none w-32 h-32 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden relative group cursor-pointer border border-[#e7edf3] dark:border-slate-600">
                                            <div className="bg-cover bg-center w-full h-full hover:scale-105 transition-transform duration-300" data-alt="Close up photo of trash on the floor" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKcaduEKUl2AaXLswRe-a72BI_EL8kdTD5Y2pVsAOEkqTGn1ZVqw1WOnOrg6tXjkqrWj0jJwlsamafF2UfhIYRQ23qREqD8CXI6mVv2apUsgtnXO0xn7yfofxmXh0c0YAMArT7Xu6iSG6u_dr1o8eC6BdUgcgJg3JUk_lngR1FvSex2l7qUHEeZbwJvSIHbGx3umzVd76Tz55rMaF9f1hF5j-ROkdOqwECvgBrHJoPadno_AzO_OBpx8_VbTLNXZWQRYyNzT5VZS7_')" }}>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-[#0d141b] dark:text-white mb-6">Activity History</h3>
                                    <div className="relative pl-8 border-l border-[#e7edf3] dark:border-slate-700 space-y-8">
                                        <div className="relative group">
                                            <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-600 border-4 border-white dark:border-slate-800"></div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-[#0d141b] dark:text-white">Agent Sarah Jenkins</span>
                                                    <span className="text-xs text-[#4c739a]">10:15 AM</span>
                                                </div>
                                                <p className="text-sm text-[#4c739a] dark:text-slate-300">Notified cleaning supervisor via internal radio. Expected resolution within 30 mins.</p>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900 border-4 border-white dark:border-slate-800 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[10px] text-indigo-600 dark:text-indigo-300">smart_toy</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">System AI</span>
                                                    <span className="text-xs text-[#4c739a]">10:01 AM</span>
                                                </div>
                                                <p className="text-sm text-[#4c739a] dark:text-slate-300">Auto-classified as <span className="font-medium text-[#0d141b] dark:text-white">Sanitation / Hygiene</span> with High Priority.</p>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute -left-[39px] top-1 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 border-4 border-white dark:border-slate-800 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[10px] text-green-600 dark:text-green-300">add</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-[#0d141b] dark:text-white">Ticket Created</span>
                                                    <span className="text-xs text-[#4c739a]">10:00 AM</span>
                                                </div>
                                                <p className="text-sm text-[#4c739a] dark:text-slate-300">Submitted via Mobile App by Guest User.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-[#e7edf3] dark:border-slate-700">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-bold text-[#0d141b] dark:text-white">Add Internal Note or Response</h4>
                                                <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span> Insert AI Suggestion
                                                </button>
                                            </div>
                                            <div className="bg-[#f6f7f8] dark:bg-slate-900 rounded-lg p-3">
                                                <textarea className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 min-h-[100px] text-[#0d141b] dark:text-white placeholder-[#4c739a]" placeholder="Type your response here..."></textarea>
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                    <div className="flex gap-2">
                                                        <button className="p-1 text-[#4c739a] hover:text-primary rounded">
                                                            <span className="material-symbols-outlined text-[20px]">attach_file</span>
                                                        </button>
                                                        <button className="p-1 text-[#4c739a] hover:text-primary rounded">
                                                            <span className="material-symbols-outlined text-[20px]">format_bold</span>
                                                        </button>
                                                    </div>
                                                    <button className="bg-primary hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                                                        <span>Send Response</span>
                                                        <span className="material-symbols-outlined text-[16px]">send</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-5 shadow-sm flex flex-col gap-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#4c739a] mb-1">Ticket Details</h3>
                                    <div className="grid grid-cols-2 gap-y-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-[#4c739a]">Status</span>
                                            <div className="inline-flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
                                                <span className="text-sm font-medium text-[#0d141b] dark:text-white">In Progress</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-[#4c739a]">Priority</span>
                                            <div className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md w-fit">
                                                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                                                <span className="text-sm font-bold">High</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 col-span-2">
                                            <span className="text-xs text-[#4c739a]">Assigned Unit</span>
                                            <select className="form-select text-sm border-[#e7edf3] dark:border-slate-600 bg-[#f6f7f8] dark:bg-slate-700 rounded-lg py-2 pl-3 pr-8 focus:border-primary focus:ring-0 text-[#0d141b] dark:text-white">
                                                <option>Ward B - Sanitation</option>
                                                <option>General Maintenance</option>
                                                <option>Security</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#4c739a]">timer</span> SLA Timer
                                        </h3>
                                        <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">Near Breach</span>
                                    </div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-2xl font-black text-[#0d141b] dark:text-white">01h 45m</span>
                                        <span className="text-xs text-[#4c739a]">remaining</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                    <p className="text-xs text-[#4c739a] mt-2">Target resolution: Today, 2:00 PM</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-[#0d141b] dark:text-white">Customer Sentiment</h3>
                                        <span className="material-symbols-outlined text-[#4c739a]">sentiment_dissatisfied</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 flex-none">
                                            <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                                <path className="text-gray-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                                                <path className="text-red-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="80, 100" strokeWidth="4"></path>
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-sm">-0.8</div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">Negative</span>
                                            <span className="text-xs text-[#4c739a] leading-tight">User language indicates frustration and urgency.</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#e7edf3] dark:border-slate-700 p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-[#0d141b] dark:text-white mb-4">Reporter Info</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[#4c739a] dark:text-white font-bold text-sm">
                                            JD
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#0d141b] dark:text-white">John Doe</p>
                                            <p className="text-xs text-[#4c739a]">Patient Family Member</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <a className="flex items-center gap-3 text-sm text-[#4c739a] hover:text-primary transition-colors" href="#">
                                            <span className="material-symbols-outlined text-[18px]">mail</span>
                                            john.doe@example.com
                                        </a>
                                        <a className="flex items-center gap-3 text-sm text-[#4c739a] hover:text-primary transition-colors" href="#">
                                            <span className="material-symbols-outlined text-[18px]">call</span>
                                            +1 (555) 123-4567
                                        </a>
                                        <div className="flex items-center gap-3 text-sm text-[#4c739a]">
                                            <span className="material-symbols-outlined text-[18px]">history</span>
                                            <span>2 previous tickets</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TicketDetailView;
