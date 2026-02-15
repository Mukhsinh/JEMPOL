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
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col">
            <p className="text-white text-sm font-medium pb-2">Email</p>
            <input
              className="w-full rounded-lg text-white bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 px-4 text-base"
              placeholder="admin@jempol.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col">
            <p className="text-white text-sm font-medium pb-2">Kata Sandi</p>
            <input
              className="w-full rounded-lg text-white bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 px-4 text-base"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            className="w-full rounded-lg bg-blue-600 h-12 text-white text-base font-bold hover:bg-blue-700 transition-colors mt-2"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Sedang Masuk...' : 'Masuk Sistem'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
