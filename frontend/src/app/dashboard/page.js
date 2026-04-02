'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [warranty, setWarranty] = useState([]);
  const [coins, setCoins] = useState({ coins: 50, level: 'Bronze', nextLevel: { name: 'Silver', threshold: 500 } });

  const token = typeof window !== 'undefined' ? localStorage.getItem('compario_token') : null;

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/alerts`, { headers })
      .then(r => r.json()).then(d => setAlerts(d.data || [])).catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/warranty`, { headers })
      .then(r => r.json()).then(d => setWarranty(d.data || [])).catch(() => {});
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/coins`, { headers })
      .then(r => r.json()).then(d => { if (d.success) setCoins(d.data); }).catch(() => {});
  }, [token]);

  const activeAlerts = alerts.filter(a => !a.isTriggered);
  const triggeredAlerts = alerts.filter(a => a.isTriggered);
  const activeWarranty = warranty.filter(w => w.status === 'active');
  const expiringWarranty = warranty.filter(w => w.status === 'expiring');
  const fmt = (p) => '₹' + Number(p).toLocaleString('en-IN');

  const levelColors = {
    Bronze: { bg: 'rgba(180,83,9,0.15)', border: 'rgba(180,83,9,0.3)', text: '#b45309', next: 500 },
    Silver: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8', next: 2000 },
    Gold: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24', next: 5000 },
    Platinum: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', text: '#a78bfa', next: 10000 },
  };
  const lc = levelColors[coins.level] || levelColors.Bronze;
  const coinProgress = Math.min(100, (coins.coins / (coins.nextLevel?.threshold || 500)) * 100);

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
          Here's what's happening with your account today
        </p>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {/* Winner Coins — Large */}
        <div className="sm:col-span-2 lg:col-span-1 rounded-3xl border p-6"
          style={{ background: `linear-gradient(135deg, ${lc.bg}, rgba(251,146,60,0.08))`, borderColor: lc.border }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: lc.text }}>
                🏆 Winner Coins
              </div>
              <div className="text-4xl font-black" style={{ color: lc.text }}>
                {coins.coins}
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-black border"
              style={{ background: lc.bg, borderColor: lc.border, color: lc.text }}>
              {coins.level}
            </div>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text3)' }}>
              <span>Progress to {coins.nextLevel?.name}</span>
              <span>{coins.coins} / {coins.nextLevel?.threshold}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${coinProgress}%`, background: `linear-gradient(90deg, ${lc.text}, #fb923c)` }} />
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Earn coins by setting alerts, tracking warranty, and completing your quiz
          </p>
        </div>

        {/* Active Alerts */}
        <Link href="/dashboard/alerts">
          <div className="rounded-3xl border p-6 hover:scale-[1.02] transition-all cursor-pointer group h-full"
            style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
            <div className="text-xs font-black uppercase tracking-widest mb-3 text-blue-400">🔔 Price Alerts</div>
            <div className="text-4xl font-black mb-1 text-blue-400">{activeAlerts.length}</div>
            <div className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Active alerts</div>
            {triggeredAlerts.length > 0 && (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                ✅ {triggeredAlerts.length} triggered today
              </div>
            )}
            <div className="mt-3 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
              Manage alerts →
            </div>
          </div>
        </Link>

        {/* Warranty Health */}
        <Link href="/dashboard/warranty">
          <div className="rounded-3xl border p-6 hover:scale-[1.02] transition-all cursor-pointer group h-full"
            style={{ background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.2)' }}>
            <div className="text-xs font-black uppercase tracking-widest mb-3 text-emerald-400">🛡️ Warranty Tracker</div>
            <div className="text-4xl font-black mb-1 text-emerald-400">{activeWarranty.length}</div>
            <div className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Products covered</div>
            {expiringWarranty.length > 0 && (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                ⚠️ {expiringWarranty.length} expiring soon
              </div>
            )}
            <div className="mt-3 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              Track warranty →
            </div>
          </div>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border p-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text3)' }}>
          Quick Actions
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🤖', label: 'Take Expert Quiz', href: '/assistant', color: 'blue' },
            { icon: '📱', label: 'Browse Phones', href: '/phones', color: 'violet' },
            { icon: '🔔', label: 'Set Price Alert', href: '/dashboard/alerts', color: 'amber' },
            { icon: '🛡️', label: 'Add Warranty', href: '/dashboard/warranty', color: 'emerald' },
          ].map(action => (
            <Link key={action.label} href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border text-center hover:scale-105 transition-all"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text2)' }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}