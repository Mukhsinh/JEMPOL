import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        throw new Error(result.error);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa email dan kata sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-white font-display min-h-screen flex flex-col">
      {/* Main Layout Container */}
      <div className="flex min-h-screen w-full flex-1">
        {/* Left Side: Login Form */}
        <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 lg:px-20 xl:px-32 bg-white dark:bg-[#15202b] shadow-xl md:shadow-none z-10 relative">
          {/* Branding Header */}
          <div className="mb-10 flex items-center gap-3">
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined text-4xl">local_hospital</span>
            </div>
            <h2 className="text-[#0d141b] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">SARAH</h2>
          </div>
          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-[#0d141b] dark:text-white tracking-tight text-[32px] font-bold leading-tight text-left pb-2">Akses Portal Staf</h1>
            <p className="text-[#4c739a] dark:text-slate-400 text-base font-normal leading-normal">Silakan masuk ke Sistem Pengaduan & Layanan.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <span className="material-symbols-outlined text-red-600">error</span>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-[480px]">
            {/* Email Field */}
            <label className="flex flex-col flex-1">
              <p className="text-[#0d141b] dark:text-slate-200 text-sm font-medium leading-normal pb-2">Email</p>
              <div className="relative">
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#cfdbe7] dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-primary h-14 placeholder:text-[#4c739a] p-[15px] pl-12 text-base font-normal leading-normal transition-all"
                  placeholder="admin@jempol.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c739a]">email</span>
              </div>
            </label>
            {/* Password Field */}
            <label className="flex flex-col flex-1">
              <div className="flex justify-between items-center pb-2">
                <p className="text-[#0d141b] dark:text-slate-200 text-sm font-medium leading-normal">Kata Sandi</p>
                <a className="text-primary text-sm font-medium hover:underline" href="#">Lupa Kata Sandi?</a>
              </div>
              <div className="relative">
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#cfdbe7] dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-primary h-14 placeholder:text-[#4c739a] p-[15px] pl-12 pr-12 text-base font-normal leading-normal transition-all"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c739a]">lock</span>
              </div>
            </label>
            {/* Actions */}
            <div className="flex flex-col gap-4 mt-2">
              <button
                className="flex w-full items-center justify-center rounded-lg bg-primary px-4 h-14 text-white text-base font-bold leading-normal hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Sedang Masuk...' : 'Masuk Sistem'}
              </button>
            </div>
          </form>
          {/* Footer Meta */}
          <div className="mt-auto pt-10">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#4c739a] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                Dilindungi Standar Keamanan Enterprise
              </p>
              <div className="flex gap-4 text-xs text-[#4c739a]">
                <a className="hover:text-primary" href="#">Bantuan IT</a>
                <span>•</span>
                <a className="hover:text-primary" href="/ticket-tracker">Lacak Tiket Publik</a>
                <span>•</span>
                <a className="hover:text-primary" href="#">Kebijakan Privasi</a>
                <span>•</span>
                <span>v3.0.0</span>
              </div>
            </div>
          </div>
        </div>
        {/* Right Side: Hero Panel */}
        <div className="hidden md:flex md:w-1/2 relative bg-slate-900 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2053&q=80')" }}>
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-[#101922]/80 to-transparent"></div>
          {/* Content Container */}
          <div className="relative z-10 flex flex-col justify-end p-12 lg:p-20 w-full">
            <div className="max-w-lg">
              <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 px-4 py-1.5 text-sm font-medium text-blue-200">
                <span className="material-symbols-outlined text-[18px] mr-2">medical_services</span>
                Sistem Internal
              </div>
              <h2 className="text-white text-4xl font-bold leading-tight tracking-tight mb-4">
                Manajemen Layanan Terpadu Rumah Sakit Kota
              </h2>
              <p className="text-slate-300 text-lg font-normal leading-relaxed mb-8">
                Meningkatkan efisiensi operasional dan kepuasan pasien melalui sistem pelaporan terintegrasi berbasis AI.
              </p>
              {/* Stats / Trust Indicators */}
              <div className="flex gap-8 border-t border-white/10 pt-8">
                <div>
                  <p className="text-2xl font-bold text-white">99.9%</p>
                  <p className="text-sm text-slate-400">Reliabilitas Uptime</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">256-bit</p>
                  <p className="text-sm text-slate-400">Enkripsi SSL</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">ISO</p>
                  <p className="text-sm text-slate-400">Standar Internasional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
