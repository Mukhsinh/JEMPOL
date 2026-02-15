

const UserProfile = () => {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200">
            {/* Main Layout */}
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
                        {/* Breadcrumbs */}
                        <div className="flex flex-wrap gap-2 px-4 py-2">
                            <a className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm font-medium leading-normal transition-colors" href="#">Beranda</a>
                            <span className="text-slate-400 dark:text-slate-600 text-sm font-medium leading-normal">/</span>
                            <span className="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Profil Pengguna</span>
                        </div>
                        {/* Page Heading */}
                        <div className="flex flex-wrap justify-between gap-3 px-4 pt-4 pb-2">
                            <div className="flex min-w-72 flex-col gap-2">
                                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-bold leading-tight tracking-[-0.033em]">Pengaturan Profil</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Kelola informasi pribadi, unit kerja, dan preferensi akun Anda.</p>
                            </div>
                        </div>
                        {/* Profile Header Card */}
                        <div className="mx-4 mt-6 mb-4 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                                <div className="relative group">
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 md:h-32 md:w-32 ring-4 ring-slate-50 dark:ring-slate-700" data-alt="Portrait of a professional man in a suit" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDHhFErpqL1patZIsAAfh3uODm8dFjHn_UT_o8SlUEArxnC9vPeHdgGj4rjgK5uYVbk0BYpKwRCthLPHfBRRZ-E8jctMoTUv6Wg1peS63XQFaHTx3PEWMnkQkDq0x3MFzUePX204ETznHCIWwIIGgDudNzKhiMK8eY2sRkjOmMR2gM71LmbG8I7eE1J1FjrTNbcErMsGNvVaw1N6SOqcL2pF3C-VA7ZEZU9lfOJRzOKgZgiPFbJfg1KnZw7UiWD_9ZbKU1CFAoB8rdG")' }}>
                                    </div>
                                    <button aria-label="Change Photo" className="absolute bottom-0 right-0 bg-primary hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors flex items-center justify-center border-2 border-white dark:border-slate-800">
                                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                                    </button>
                                </div>
                                <div className="flex flex-col justify-center text-center md:text-left flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-1">
                                        <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">Budi Santoso, S.Kom</h2>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Akun Aktif
                                        </span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-300 text-base font-medium">Kepala Unit Radiologi</p>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px]">badge</span>
                                            <span>NIP: 19800101 200501 1 003</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px]">apartment</span>
                                            <span>RSUD Kota Harapan</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center h-full">
                                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        Keluar
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Tabs Navigation */}
                        <div className="px-4 mt-2">
                            <div className="border-b border-slate-200 dark:border-slate-700">
                                <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                                    <a className="border-primary text-primary whitespace-nowrap py-4 px-1 border-b-[3px] font-semibold text-sm flex items-center gap-2" href="#">
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                        Data Diri
                                    </a>
                                    <a className="border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-[3px] font-medium text-sm flex items-center gap-2 transition-colors" href="#">
                                        <span className="material-symbols-outlined text-[20px]">lock</span>
                                        Keamanan
                                    </a>
                                    <a className="border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-[3px] font-medium text-sm flex items-center gap-2 transition-colors" href="#">
                                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                                        Preferensi
                                    </a>
                                </nav>
                            </div>
                        </div>
                        {/* Main Content Area */}
                        <div className="p-4">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                {/* Section Header */}
                                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold leading-6 text-slate-900 dark:text-white">Informasi Dasar</h3>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Perbarui detail foto dan informasi pribadi Anda di sini.</p>
                                    </div>
                                </div>
                                {/* Form Content */}
                                <div className="p-6 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        {/* Full Name */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-white mb-2" htmlFor="full-name">Nama Lengkap</label>
                                            <div className="relative">
                                                <input className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:ring-slate-700 dark:text-white sm:text-sm sm:leading-6" id="full-name" name="full-name" type="text" defaultValue="Budi Santoso" />
                                                <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-[20px]">edit</span>
                                            </div>
                                        </div>
                                        {/* NIP (Read Only) */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-white mb-2" htmlFor="nip">Nomor Induk Pegawai (NIP)</label>
                                            <div className="relative">
                                                <input className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-500 shadow-sm ring-1 ring-inset ring-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:ring-slate-700 dark:text-slate-400 sm:text-sm sm:leading-6 cursor-not-allowed" disabled id="nip" name="nip" type="text" defaultValue="19800101 200501 1 003" />
                                                <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 text-[20px]">lock</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Hubungi admin untuk mengubah NIP.</p>
                                        </div>
                                        {/* Email */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-white mb-2" htmlFor="email">Alamat Email</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">mail</span>
                                                <input className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:ring-slate-700 dark:text-white sm:text-sm sm:leading-6" id="email" name="email" type="email" defaultValue="budi.santoso@rsud.go.id" />
                                            </div>
                                        </div>
                                        {/* Phone Number */}
                                        <div className="col-span-1">
                                            <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-white mb-2" htmlFor="phone">Nomor Telepon / WhatsApp</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">call</span>
                                                <input className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:ring-slate-700 dark:text-white sm:text-sm sm:leading-6" id="phone" name="phone" type="tel" defaultValue="+62 812 3456 7890" />
                                            </div>
                                        </div>
                                        {/* Unit / Department */}
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-white mb-2" htmlFor="unit">Unit Kerja</label>
                                            <select className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:ring-slate-700 dark:text-white sm:text-sm sm:leading-6" id="unit" name="unit">
                                                <option>Unit Radiologi</option>
                                                <option>Unit Gawat Darurat (IGD)</option>
                                                <option>Administrasi & Keuangan</option>
                                                <option>Poliklinik Umum</option>
                                                <option>Instalasi Farmasi</option>
                                            </select>
                                        </div>
                                        {/* Bio / Notes */}
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-white mb-2" htmlFor="about">Catatan Tambahan (Opsional)</label>
                                            <textarea className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:ring-slate-700 dark:text-white sm:text-sm sm:leading-6" id="about" name="about" placeholder="Tuliskan catatan singkat tentang peran Anda..." rows={3}></textarea>
                                        </div>
                                    </div>
                                </div>
                                {/* Footer Actions */}
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-x-4">
                                    <button className="text-sm font-semibold leading-6 text-slate-900 dark:text-white hover:underline" type="button">Batal</button>
                                    <button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors flex items-center gap-2" type="submit">
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                            {/* Security Section Teaser (To imply it's handled below or reachable) */}
                            <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                                <div className="px-6 py-5 flex justify-between items-center cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full text-primary">
                                            <span className="material-symbols-outlined">lock_reset</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold leading-6 text-slate-900 dark:text-white">Keamanan Akun</h3>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ubah kata sandi dan pengaturan autentikasi 2 faktor.</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
