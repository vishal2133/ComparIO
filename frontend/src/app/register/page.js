'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
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

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];

  return (
    <main className="min-h-screen t-bg flex items-center justify-center px-6 py-12">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black t-text tracking-tighter">
              Compar<span className="text-blue-400">IO</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Create your free account</p>
        </div>

        <div className="bg-white/[0.04] border t-border rounded-3xl p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-black t-text mb-2 tracking-tight">Join ComparIO 🚀</h1>
          <p className="t-text2 text-sm mb-6">Get price alerts, save wishlists and more</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Vishal Kumar"
                required
                className="w-full t-input border t-border rounded-xl px-4 py-3.5 t-text text-sm outline-none focus:border-blue-500/50 placeholder-gray-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
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
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-bold ${strength === 1 ? 'text-red-400' : strength === 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                className={`w-full t-input border rounded-xl px-4 py-3.5 t-text text-sm outline-none placeholder-gray-600 transition ${
                  confirm && password !== confirm ? 'border-red-500/40' : 't-border focus:border-blue-500/50'
                }`}
              />
              {confirm && password !== confirm && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (confirm && password !== confirm)}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 t-text font-black py-4 rounded-xl transition-all hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-xs t-text3 mt-4">
            By signing up you agree to our Terms & Privacy Policy
          </p>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="t-text2 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 transition">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}