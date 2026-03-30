'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ── TICKER MESSAGES ──────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { icon: '🚀', text: 'Found ₹2,400 off a MacBook for a coder in Kolkata' },
  { icon: '🛡️', text: 'Flagged 14 fake reviews on a trending smartphone' },
  { icon: '💰', text: 'Samsung S25 Ultra dropped ₹3,000 on Flipkart' },
  { icon: '🤖', text: 'AI matched a student in Mumbai with the perfect ₹28K laptop' },
  { icon: '🔥', text: 'OnePlus 13 at ₹62,999 — lowest in 30 days on Amazon' },
  { icon: '✅', text: 'Verified 847 genuine reviews on Nothing Phone 3a' },
  { icon: '📉', text: 'iPhone 17 Pro Max price fell ₹5,000 this week' },
  { icon: '🎯', text: 'Expert match completed — saved user 3 hours of research' },
  { icon: '⚡', text: 'Prices updated 6 minutes ago across all products' },
  { icon: '🛒', text: 'Dell XPS 13 cheapest on Amazon right now — ₹1,17,999' },
];

// ── BENTO FEATURES ────────────────────────────────────────────────────────────
const BENTO = [
  {
    id: 'scanner',
    size: 'large',
    title: 'Deal Scanner',
    desc: 'Watch our AI find real savings in real time',
    icon: '🔍',
    color: 'from-blue-600/20 to-cyan-600/20',
    accent: '#22d3ee',
  },
  {
    id: 'history',
    size: 'small',
    title: 'Price History',
    desc: 'Track every price movement over time',
    icon: '📈',
    color: 'from-violet-600/20 to-pink-600/20',
    accent: '#a78bfa',
  },
  {
    id: 'assistant',
    size: 'small',
    title: 'AI Expert Match',
    desc: '10 questions → perfect device in 60s',
    icon: '🤖',
    color: 'from-green-600/20 to-emerald-600/20',
    accent: '#34d399',
  },
  {
    id: 'reviews',
    size: 'small',
    title: 'Review Shield',
    desc: 'AI detects fake reviews before you buy',
    icon: '🛡️',
    color: 'from-orange-600/20 to-amber-600/20',
    accent: '#fb923c',
  },
  {
    id: 'price',
    size: 'small',
    title: 'True Price Calculator',
    desc: 'Bank offers + exchange = real price',
    icon: '🧮',
    color: 'from-rose-600/20 to-red-600/20',
    accent: '#fb7185',
  },
];

// ── DEAL SCANNER ANIMATION ────────────────────────────────────────────────────
function DealScanner() {
  const [phase, setPhase] = useState(0);
  // 0 = scanning, 1 = found

  useEffect(() => {
    const cycle = () => {
      setPhase(0);
      const t1 = setTimeout(() => setPhase(1), 2200);
      const t2 = setTimeout(() => { setPhase(0); cycle(); }, 5000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    };
    const cleanup = cycle();
    return cleanup;
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-6 select-none">
      {/* Product card */}
      <div className="relative w-full max-w-[260px] rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>

        {/* Scanner beam */}
        <div
          className="absolute left-0 right-0 h-0.5 z-20 transition-none"
          style={{
            background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
            boxShadow: '0 0 12px 3px rgba(34,211,238,0.6)',
            top: phase === 0 ? '0%' : '100%',
            transition: phase === 0 ? 'top 2s linear' : 'none',
          }}
        />

        <div className="p-5">
          <div className="w-full h-28 rounded-xl mb-4 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <span className="text-5xl">📱</span>
          </div>
          <div className="text-xs font-bold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Samsung</div>
          <div className="font-black text-white text-sm mb-3">Galaxy S25 Ultra</div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Listed price</div>
              <div className={`font-black text-lg transition-all duration-500 ${phase === 1 ? 'line-through opacity-30 text-red-400' : 'text-white'}`}>
                ₹1,34,999
              </div>
            </div>

            {phase === 1 && (
              <div className="text-right animate-pop">
                <div className="text-xs text-emerald-400 font-bold mb-0.5">Best Deal Found!</div>
                <div className="font-black text-xl text-emerald-400">₹1,29,999</div>
                <div className="text-xs text-emerald-500">Save ₹5,000 🎉</div>
              </div>
            )}
          </div>

          {phase === 1 && (
            <div className="mt-3 py-2 rounded-xl text-center text-xs font-black text-white animate-pop"
              style={{ background: 'linear-gradient(90deg, #059669, #10b981)' }}>
              ✓ Cheapest on Flipkart right now
            </div>
          )}
        </div>
      </div>

      {/* Scanning indicator */}
      {phase === 0 && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold"
            style={{ color: 'rgba(34,211,238,0.8)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Scanning for best price...
          </div>
        </div>
      )}
    </div>
  );
}

// ── SPARKLINE CHART ───────────────────────────────────────────────────────────
function Sparkline() {
  const prices = [134999, 132000, 135999, 131000, 129999, 133000, 129999];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  const w = 200, h = 60, pad = 8;

  const points = prices.map((p, i) => ({
    x: pad + (i / (prices.length - 1)) * (w - pad * 2),
    y: pad + ((max - p) / range) * (h - pad * 2),
  }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fill = `${path} L ${points[points.length-1].x} ${h} L ${points[0].x} ${h} Z`;

  return (
    <div className="w-full px-2">
      <div className="flex justify-between text-xs mb-2 font-bold">
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>30-day price trend</span>
        <span className="text-emerald-400">▼ ₹5,000</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#sparkGrad)" />
        <path d={path} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Current price dot */}
        <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="3" fill="#a78bfa" />
        <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="6" fill="#a78bfa" fillOpacity="0.3" />
      </svg>
      <div className="flex justify-between text-xs mt-1">
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>30 days ago</span>
        <span className="font-black" style={{ color: '#a78bfa' }}>₹1,29,999 today</span>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tickerPos, setTickerPos] = useState(0);
  const searchRef = useRef(null);
  const tickerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?featured=true`)
      .then(r => r.json())
      .then(d => setFeatured(d.data || []));

    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearchOpen(false); return; }
    setSearching(true);
    const t = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search?q=${query}`)
        .then(r => r.json())
        .then(d => { setResults(d.data || []); setSearchOpen(true); setSearching(false); });
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const fmt = (p) => '₹' + p.toLocaleString('en-IN');
  const best = (prices) => Math.min(...prices.map(p => p.price));
  const phoneFeatured = featured.filter(p => p.category === 'phone').slice(0, 4);
  const laptopFeatured = featured.filter(p => p.category === 'laptop').slice(0, 3);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── INJECT KEYFRAMES ─────────────────────────────────────────── */}
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop { animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }

        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .float-1 { animation: floatY 4s ease-in-out infinite; }
        .float-2 { animation: floatY 5s ease-in-out 0.5s infinite; }
        .float-3 { animation: floatY 6s ease-in-out 1s infinite; }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #60a5fa, #a78bfa, #34d399, #60a5fa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }

        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .ticker-track { animation: ticker 30s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="glow-pulse absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'rgba(59,130,246,0.12)' }} />
          <div className="glow-pulse absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: 'rgba(139,92,246,0.10)', animationDelay: '1.5s' }} />
          <div className="glow-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px]"
            style={{ background: 'rgba(34,211,238,0.06)', animationDelay: '3s' }} />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(var(--text) 1px,transparent 1px),linear-gradient(90deg,var(--text) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />

        {/* Floating product cards in background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { emoji: '📱', top: '15%', left: '5%', cls: 'float-1' },
            { emoji: '💻', top: '20%', right: '6%', cls: 'float-2' },
            { emoji: '⌚', top: '65%', left: '4%', cls: 'float-3' },
            { emoji: '🎧', top: '70%', right: '5%', cls: 'float-1' },
          ].map((item, i) => (
            <div key={i}
              className={`absolute text-4xl md:text-5xl opacity-10 ${item.cls}`}
              style={{ top: item.top, left: item.left, right: item.right }}>
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className={`relative z-10 text-center max-w-4xl mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-8 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Shopping Intelligence · India
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
            <span className="block" style={{ color: 'var(--text)' }}>Meet Your New</span>
            <span className="block shimmer-text">Tech Bodyguard.</span>
          </h1>

          <p className="text-lg md:text-xl max-w-xl mx-auto mb-4 leading-relaxed" style={{ color: 'var(--text2)' }}>
            We find the perfect phone or laptop for your life —
            not just the <span style={{ color: 'var(--text)' }} className="font-bold">lowest price.</span>
          </p>

          <p className="text-sm max-w-md mx-auto mb-10" style={{ color: 'var(--text3)' }}>
            Backed by real-time price tracking, AI review analysis, and a 10-question expert match engine.
          </p>

          {/* PRIMARY CTA */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-10">
            <Link href="/assistant"
              className="group relative inline-flex items-center gap-3 text-white font-black px-8 py-4 rounded-2xl text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 8px 32px rgba(37,99,235,0.35)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }} />
              <span className="relative z-10 text-2xl">🤖</span>
              <div className="relative z-10 text-left">
                <div>Start My Expert Match</div>
                <div className="text-xs font-normal opacity-75">60 seconds · Free · No signup needed</div>
              </div>
              <span className="relative z-10 text-xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <div className="flex gap-3">
              <Link href="/phones"
                className="inline-flex items-center gap-2 font-bold px-5 py-4 rounded-2xl border transition-all hover:scale-105 hover:border-blue-500/40 hover:bg-blue-500/10 text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text2)', background: 'var(--surface)' }}>
                📱 Phones
              </Link>
              <Link href="/laptops"
                className="inline-flex items-center gap-2 font-bold px-5 py-4 rounded-2xl border transition-all hover:scale-105 hover:border-violet-500/40 hover:bg-violet-500/10 text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text2)', background: 'var(--surface)' }}>
                💻 Laptops
              </Link>
            </div>
          </div>

          {/* Smart Search Bar */}
          <div ref={searchRef} className="relative max-w-2xl mx-auto">
            <div className="flex items-center rounded-2xl px-5 py-4 gap-3 border transition-all"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                backdropFilter: 'blur(20px)',
              }}>
              <span style={{ color: 'var(--text3)', fontSize: '18px' }}>{searching ? '⏳' : '🔗'}</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search a product or paste Amazon / Flipkart link to check price..."
                className="bg-transparent flex-1 outline-none text-sm"
                style={{ color: 'var(--text)', caretColor: 'var(--accent)' }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setSearchOpen(false); }}
                  style={{ color: 'var(--text3)' }}
                  className="hover:scale-110 transition-transform text-lg">×</button>
              )}
              <button className="text-white font-black text-xs px-4 py-2 rounded-xl transition hover:scale-105 flex-shrink-0"
                style={{ background: 'var(--accent)' }}>
                Search
              </button>
            </div>

            {/* Search results */}
            {searchOpen && results.length > 0 && (
              <div className="absolute top-14 left-0 right-0 rounded-2xl shadow-2xl z-50 overflow-hidden border"
                style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
                {results.slice(0, 5).map(p => (
                  <Link key={p._id} href={`/product/${p.slug}`}
                    onClick={() => { setQuery(''); setSearchOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition border-b last:border-0"
                    style={{ borderColor: 'var(--border)' }}>
                    <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ background: 'var(--surface)' }}>
                      <img src={p.image} alt={p.name} className="w-7 h-7 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs truncate" style={{ color: 'var(--text)' }}>{p.name}</div>
                      <div className="text-[10px] capitalize" style={{ color: 'var(--text3)' }}>{p.brand} · {p.category}</div>
                    </div>
                    <div className="font-black text-blue-400 text-xs">
                      {p.prices?.length ? fmt(best(p.prices)) : '—'}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce"
          style={{ color: 'var(--text3)' }}>
          <span className="text-xs font-bold tracking-widest uppercase">Scroll</span>
          <span>↓</span>
        </div>
      </section>

      {/* ── LIVE TRUST TICKER ─────────────────────────────────────────── */}
      <div className="relative py-4 overflow-hidden border-y"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="flex ticker-track gap-0" style={{ width: 'max-content' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i}
              className="flex items-center gap-2 px-6 text-sm font-bold flex-shrink-0 border-r"
              style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BENTO GRID ────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text3)' }}>
              ✨ What makes us different
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: 'var(--text)' }}>
              Your complete<br />
              <span className="text-blue-400">shopping arsenal</span>
            </h2>
          </div>

          {/* Bento layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* DEAL SCANNER — Large */}
            <div className="md:col-span-2 md:row-span-2 rounded-3xl border overflow-hidden relative min-h-[380px]"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(34,211,238,0.08))',
                borderColor: 'rgba(34,211,238,0.2)',
              }}>
              <div className="absolute top-5 left-5 z-10">
                <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(34,211,238,0.7)' }}>
                  🔍 Live Deal Scanner
                </div>
                <h3 className="text-xl font-black" style={{ color: 'var(--text)' }}>
                  Watch AI find savings
                </h3>
                <p className="text-xs mt-1 max-w-[200px]" style={{ color: 'var(--text3)' }}>
                  Real-time price comparison running every 6 hours
                </p>
              </div>
              <DealScanner />
            </div>

            {/* PRICE HISTORY */}
            <div className="rounded-3xl border p-6 relative overflow-hidden hover:scale-[1.02] transition-all cursor-pointer group"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.08))',
                borderColor: 'rgba(139,92,246,0.2)',
              }}>
              <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(167,139,250,0.8)' }}>
                📈 Price History
              </div>
              <h3 className="text-base font-black mb-3" style={{ color: 'var(--text)' }}>
                Track every drop
              </h3>
              <Sparkline />
            </div>

            {/* AI EXPERT MATCH */}
            <Link href="/assistant"
              className="rounded-3xl border p-6 relative overflow-hidden hover:scale-[1.02] transition-all cursor-pointer group block"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.08))',
                borderColor: 'rgba(52,211,153,0.2)',
              }}>
              <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(52,211,153,0.8)' }}>
                🤖 AI Expert Match
              </div>
              <h3 className="text-base font-black mb-2" style={{ color: 'var(--text)' }}>
                Perfect device in 60s
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
                10 smart questions → personalised pick from our full catalog
              </p>
              <div className="flex items-center gap-2">
                {['📷', '🔋', '⚡', '💰', '🎮'].map((emoji, i) => (
                  <div key={i}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                    style={{ background: 'rgba(52,211,153,0.1)' }}>
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-4 right-4 text-emerald-400 font-black text-sm group-hover:translate-x-1 transition-transform">
                Try it →
              </div>
            </Link>

            {/* REVIEW SHIELD */}
            <div className="rounded-3xl border p-6 relative overflow-hidden hover:scale-[1.02] transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(251,146,60,0.08), rgba(245,158,11,0.08))',
                borderColor: 'rgba(251,146,60,0.2)',
              }}>
              <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(251,146,60,0.8)' }}>
                🛡️ Review Shield
              </div>
              <h3 className="text-base font-black mb-2" style={{ color: 'var(--text)' }}>
                AI detects fake reviews
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
                Before you buy, we flag suspicious patterns in product reviews
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '78%' }} />
                </div>
                <span className="text-xs font-black text-emerald-400">78% genuine</span>
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Based on 342 reviews analysed</div>
            </div>

            {/* TRUE PRICE */}
            <div className="rounded-3xl border p-6 relative overflow-hidden hover:scale-[1.02] transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(251,113,133,0.08), rgba(239,68,68,0.08))',
                borderColor: 'rgba(251,113,133,0.2)',
              }}>
              <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(251,113,133,0.8)' }}>
                🧮 True Price Calc
              </div>
              <h3 className="text-base font-black mb-3" style={{ color: 'var(--text)' }}>
                What you actually pay
              </h3>
              <div className="flex flex-col gap-1.5 text-xs">
                {[
                  { label: 'Listed Price', val: '₹74,999', color: 'var(--text2)' },
                  { label: '− Bank Offer (HDFC)', val: '− ₹3,000', color: '#34d399' },
                  { label: '− Exchange (old phone)', val: '− ₹8,000', color: '#34d399' },
                  { label: '+ EMI Interest (6mo)', val: '+ ₹1,200', color: '#fb923c' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-1 border-b"
                    style={{ borderColor: 'var(--border)' }}>
                    <span style={{ color: 'var(--text3)' }}>{row.label}</span>
                    <span className="font-black text-xs" style={{ color: row.color }}>{row.val}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1">
                  <span className="font-black text-xs" style={{ color: 'var(--text)' }}>True Price</span>
                  <span className="font-black text-sm" style={{ color: '#fb7185' }}>₹65,199</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10 tracking-tight" style={{ color: 'var(--text)' }}>
            Save money in <span className="text-blue-400">3 steps</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {[
              { icon: '🤖', step: '01', title: 'Tell us your needs', desc: 'Answer 10 smart questions — budget, priorities, usage style. No tech jargon.' },
              { icon: '🔍', step: '02', title: 'We do the hard work', desc: 'AI filters 35+ products, compares real prices, flags fake deals.' },
              { icon: '🛒', step: '03', title: 'Buy with confidence', desc: 'Get your perfect match with verified prices and genuine reviews.' },
            ].map((s, i) => (
              <div key={s.step}
                className="t-card rounded-3xl p-7 hover:border-blue-500/30 hover:scale-[1.02] transition-all group">
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="text-xs font-black tracking-widest mb-2" style={{ color: 'var(--text3)' }}>{s.step}</div>
                <div className="font-black text-lg mb-2 group-hover:text-blue-400 transition" style={{ color: 'var(--text)' }}>{s.title}</div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PHONES ───────────────────────────────────────────── */}
      {phoneFeatured.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-xs font-black uppercase tracking-widest mb-1 text-blue-400">📱 Phones</div>
                <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Top picks right now</h2>
              </div>
              <Link href="/phones" className="text-sm font-bold hover:text-blue-400 transition" style={{ color: 'var(--text3)' }}>
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {phoneFeatured.map((p, i) => (
                <Link key={p._id} href={`/product/${p.slug}`}>
                  <div className="group t-card rounded-2xl p-5 hover:border-blue-500/30 hover:scale-[1.02] transition-all h-full flex flex-col"
                    style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="rounded-xl p-4 mb-4 flex items-center justify-center h-36"
                      style={{ background: 'var(--surface)' }}>
                      <img src={p.image} alt={p.name} className="h-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="text-xs mb-1" style={{ color: 'var(--text3)' }}>{p.brand}</div>
                    <div className="font-black text-sm leading-tight mb-3 flex-1" style={{ color: 'var(--text)' }}>{p.name}</div>
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <div className="text-xs" style={{ color: 'var(--text3)' }}>Best price</div>
                        <div className="text-lg font-black text-blue-400">{fmt(best(p.prices))}</div>
                      </div>
                      <span className="text-xs font-black group-hover:text-blue-400 transition" style={{ color: 'var(--text3)' }}>
                        Compare →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED LAPTOPS ──────────────────────────────────────────── */}
      {laptopFeatured.length > 0 && (
        <section className="py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-xs font-black uppercase tracking-widest mb-1 text-violet-400">💻 Laptops</div>
                <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Best laptops today</h2>
              </div>
              <Link href="/laptops" className="text-sm font-bold hover:text-violet-400 transition" style={{ color: 'var(--text3)' }}>
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {laptopFeatured.map(p => (
                <Link key={p._id} href={`/product/${p.slug}`}>
                  <div className="group t-card rounded-2xl p-5 hover:border-violet-500/30 hover:scale-[1.02] transition-all h-full flex flex-col">
                    <div className="rounded-xl p-4 mb-4 flex items-center justify-center h-36"
                      style={{ background: 'var(--surface)' }}>
                      <img src={p.image} alt={p.name} className="h-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="text-xs mb-1" style={{ color: 'var(--text3)' }}>{p.brand}</div>
                    <div className="font-black text-sm leading-tight mb-1 flex-1" style={{ color: 'var(--text)' }}>{p.name}</div>
                    {p.processor && <div className="text-xs mb-3" style={{ color: 'var(--text3)' }}>{p.processor}</div>}
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <div className="text-xs" style={{ color: 'var(--text3)' }}>Best price</div>
                        <div className="text-lg font-black text-violet-400">{fmt(best(p.prices))}</div>
                      </div>
                      <span className="text-xs font-black group-hover:text-violet-400 transition" style={{ color: 'var(--text3)' }}>
                        Compare →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ASSISTANT BANNER ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-12 md:p-16 overflow-hidden text-center border"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))',
              borderColor: 'rgba(99,102,241,0.25)',
            }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'var(--violet-glow)' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
              style={{ background: 'var(--blue-glow)' }} />
            <div className="relative z-10">
              <div className="text-6xl mb-5 animate-bounce">🤖</div>
              <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: 'var(--text)' }}>
                Not sure what to buy?
              </h2>
              <p className="max-w-lg mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text2)' }}>
                Don't waste 3 hours reading specs you don't understand.
                Our AI asks 10 real-world questions and delivers your perfect match in 60 seconds.
              </p>
              <Link href="/assistant"
                className="inline-flex items-center gap-3 text-white font-black px-8 py-4 rounded-2xl text-lg transition-all hover:scale-105 hover:shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 8px 32px rgba(37,99,235,0.3)' }}>
                <span>🤖</span>
                Start Expert Match (Free)
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t py-12 px-6" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="font-black text-xl tracking-tighter mb-3" style={{ color: 'var(--text)' }}>
                Compar<span className="text-blue-400">IO</span>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text3)' }}>
                India's smartest price comparison and AI shopping assistant. Never overpay again.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: '📸', href: 'https://instagram.com', color: '#ec4899' },
                  { icon: '𝕏', href: 'https://twitter.com', color: '#38bdf8' },
                  { icon: '👥', href: 'https://facebook.com', color: '#60a5fa' },
                ].map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm hover:scale-110 transition-transform border"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: 'Browse', links: [{ label: '📱 Phones', href: '/phones' }, { label: '💻 Laptops', href: '/laptops' }, { label: '🤖 AI Assistant', href: '/assistant' }] },
              { title: 'Company', links: [{ label: 'About Us', href: '/about' }, { label: 'Contact', href: '/contact' }, { label: 'Affiliate Disclosure', href: '#' }] },
              { title: 'Account', links: [{ label: 'Sign In', href: '/login' }, { label: 'Create Account', href: '/register' }, { label: 'My Alerts', href: '/alerts' }] },
            ].map(col => (
              <div key={col.title}>
                <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text3)' }}>{col.title}</div>
                <ul className="flex flex-col gap-2">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link href={link.href}
                        className="text-sm hover:text-blue-400 transition"
                        style={{ color: 'var(--text2)' }}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row justify-between gap-3 text-xs"
            style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}>
            <span>© 2025 ComparIO. All rights reserved.</span>
            <span>Prices update every 6 hours · Affiliate links earn us a small commission</span>
          </div>
        </div>
      </footer>

    </main>
  );
}