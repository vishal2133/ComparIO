'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Overview', exact: true },
  { href: '/dashboard/profile', icon: '👤', label: 'My Profile' },
  { href: '/dashboard/alerts', icon: '🔔', label: 'My Alerts' },
  { href: '/dashboard/warranty', icon: '🛡️', label: 'Warranty Tracker' },
];

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-sm" style={{ color: 'var(--text3)' }}>Loading dashboard...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">

          {/* SIDEBAR */}
          <aside>
            {/* User card */}
            <div className="rounded-2xl border p-5 mb-4"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-black text-sm truncate" style={{ color: 'var(--text)' }}>{user.name}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text3)' }}>{user.email}</div>
                </div>
              </div>
              {/* Coins badge */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,146,60,0.15))', border: '1px solid rgba(251,191,36,0.3)' }}>
                <span className="text-lg">🏆</span>
                <div>
                  <div className="text-xs font-black" style={{ color: '#fbbf24' }}>Winner Coins</div>
                  <div className="text-base font-black" style={{ color: '#fbbf24' }}>50</div>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              {NAV.map(item => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-4 py-3.5 text-sm font-bold border-b transition-all last:border-0 ${
                      active ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-white/5'
                    }`}
                    style={{ borderColor: 'var(--border)', color: active ? undefined : 'var(--text2)' }}>
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </Link>
                );
              })}
              <button onClick={() => { logout(); router.push('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition">
                <span>🚪</span> Sign Out
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}