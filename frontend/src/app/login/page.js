'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.user, data.token);
        router.push('/');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Connection failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen t-bg flex items-center justify-center px-6 py-12">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black t-text tracking-tighter">
              Compar<span className="text-blue-400">IO</span>
            </span>
          </Link>
          <p className="t-text2 text-sm mt-2">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border t-border rounded-3xl p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-black t-text mb-6 tracking-tight">Welcome back 👋</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold t-text2 uppercase tracking-wider mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full t-input border t-border rounded-xl px-4 py-3.5 t-text text-sm outline-none focus:border-blue-500/50 placeholder-gray-600 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold t-text2 uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-xs t-text2 hover:text-gray-400 transition">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full t-input border t-border rounded-xl px-4 py-3.5 t-text text-sm outline-none focus:border-blue-500/50 placeholder-gray-600 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 t-text2 hover:text-gray-400 transition text-sm"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 t-text font-black py-4 rounded-xl transition-all hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="t-text2 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-400 font-bold hover:text-blue-300 transition">
                Create one →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}