'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const ref = useRef(null);
  const moreRef = useRef(null);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    setSearching(true);
    const t = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search?q=${query}`)
        .then(r => r.json())
        .then(d => { setResults(d.data || []); setOpen(true); setSearching(false); });
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const fmt = (prices) => {
    if (!prices?.length) return null;
    return '₹' + Math.min(...prices.map(p => p.price)).toLocaleString('en-IN');
  };

  const handleSelect = (slug) => {
    setQuery(''); setResults([]); setOpen(false);
    router.push(`/product/${slug}`);
  };

  const handleLogout = () => { logout(); router.push('/'); };

  const navStyle = {
    background: 'var(--nav-bg)',
    borderColor: 'var(--border)',
  };

  const dropdownStyle = {
    background: isDark ? '#0f0f1a' : '#ffffff',
    borderColor: 'var(--border)',
  };

  return (
    <>
      <nav className="border-b px-4 md:px-6 py-3 sticky top-0 z-50 backdrop-blur-xl" style={navStyle}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <span className="text-xl font-black tracking-tighter t-text group-hover:opacity-80 transition">
              Compar<span className="text-blue-400">IO</span>
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 relative max-w-md" ref={ref}>
            <div className="flex items-center rounded-xl px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all t-input border">
              <span className="t-text3 text-sm flex-shrink-0">{searching ? '⏳' : '🔍'}</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search phones, laptops..."
                className="bg-transparent flex-1 outline-none text-sm t-text placeholder:t-text3"
                style={{ color: 'var(--text)' }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setOpen(false); }}
                  className="t-text3 hover:t-text transition text-lg leading-none">×</button>
              )}
            </div>

            {/* Search dropdown */}
            {open && results.length > 0 && (
              <div className="absolute top-11 left-0 right-0 rounded-2xl shadow-2xl z-50 overflow-hidden border" style={dropdownStyle}>
                {results.slice(0, 6).map((p, i) => (
                  <button key={p._id} onClick={() => handleSelect(p.slug)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition border-b last:border-0 text-left"
                    style={{ borderColor: 'var(--border)', animationDelay: `${i * 50}ms` }}>
                    <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                      <img src={p.image} alt={p.name} className="w-7 h-7 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs truncate" style={{ color: 'var(--text)' }}>{p.name}</div>
                      <div className="text-[10px] capitalize" style={{ color: 'var(--text3)' }}>{p.brand} · {p.category}</div>
                    </div>
                    <div className="font-black text-blue-400 text-xs">{fmt(p.prices)}</div>
                  </button>
                ))}
                <div className="px-4 py-2 text-center text-xs" style={{ color: 'var(--text3)', borderTop: '1px solid var(--border)' }}>
                  Press Enter to see all results
                </div>
              </div>
            )}

            {open && query && !searching && results.length === 0 && (
              <div className="absolute top-11 left-0 right-0 rounded-2xl shadow-xl border p-4 text-center text-sm z-50" style={{ ...dropdownStyle, color: 'var(--text3)' }}>
                No results for "{query}"
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            <Link href="/phones"
              className="text-sm font-bold px-3 py-2 rounded-lg transition-all hover:bg-blue-500/10 hover:text-blue-400"
              style={{ color: 'var(--text2)' }}>
              📱 Phones
            </Link>
            <Link href="/laptops"
              className="text-sm font-bold px-3 py-2 rounded-lg transition-all hover:bg-violet-500/10 hover:text-violet-400"
              style={{ color: 'var(--text2)' }}>
              💻 Laptops
            </Link>
            <Link href="/assistant"
              className="text-sm font-bold px-3 py-2 rounded-lg transition-all hover:bg-green-500/10 hover:text-green-400"
              style={{ color: 'var(--text2)' }}>
              🤖 Assistant
            </Link>

            {/* MORE DROPDOWN */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`text-sm font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1 ${moreOpen ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-white/5'}`}
                style={{ color: moreOpen ? undefined : 'var(--text2)' }}>
                More
                <span className={`text-xs transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-11 w-64 rounded-2xl shadow-2xl border overflow-hidden z-50" style={dropdownStyle}>

                  {/* Section label */}
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
                      Pages
                    </span>
                  </div>

                  <Link href="/contact" onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition group">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                      ✉️
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Contact Us</div>
                      <div className="text-xs" style={{ color: 'var(--text3)' }}>Get in touch with our team</div>
                    </div>
                  </Link>

                  <Link href="/about" onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition group">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                      ℹ️
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>About ComparIO</div>
                      <div className="text-xs" style={{ color: 'var(--text3)' }}>Our story & mission</div>
                    </div>
                  </Link>

                  <Link href="/assistant" onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-green-500/10 transition group">
                    <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                      🤖
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Smart Assistant</div>
                      <div className="text-xs" style={{ color: 'var(--text3)' }}>AI-powered recommendations</div>
                    </div>
                  </Link>

                  {/* Divider */}
                  <div className="mx-4 my-1 border-t" style={{ borderColor: 'var(--border)' }} />

                  {/* Social label */}
                  <div className="px-4 pt-2 pb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
                      Follow Us
                    </span>
                  </div>

                  <div className="px-4 pb-4 grid grid-cols-3 gap-2 mt-1">
                    {[
                      { icon: '📸', label: 'Instagram', color: 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400', href: 'https://instagram.com' },
                      { icon: '𝕏', label: 'Twitter', color: 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400', href: 'https://twitter.com' },
                      { icon: '👥', label: 'Facebook', color: 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400', href: 'https://facebook.com' },
                    ].map(s => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all hover:scale-105 ${s.color}`}
                        onClick={() => setMoreOpen(false)}>
                        <span className="text-lg">{s.icon}</span>
                        <span className="text-[10px] font-bold">{s.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-blue-500/10 transition border"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold hidden md:block max-w-[80px] truncate" style={{ color: 'var(--text)' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>▾</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-12 w-48 rounded-2xl shadow-2xl border z-50 overflow-hidden" style={dropdownStyle}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                      <div className="text-xs font-black truncate" style={{ color: 'var(--text)' }}>{user.name}</div>
                      <div className="text-[10px] truncate" style={{ color: 'var(--text3)' }}>{user.email}</div>
                    </div>
                    {[
                      { href: '/profile', icon: '👤', label: 'My Profile' },
                      { href: '/alerts', icon: '🔔', label: 'My Alerts' },
                    ].map(item => (
                      <Link key={item.href} href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-blue-500/10 transition"
                        style={{ color: 'var(--text2)' }}>
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition border-t"
                      style={{ borderColor: 'var(--border)' }}>
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login"
                  className="text-sm font-bold px-3 py-2 rounded-lg hover:bg-blue-500/10 transition hidden md:block"
                  style={{ color: 'var(--text2)' }}>
                  Sign In
                </Link>
                <Link href="/register"
                  className="text-sm font-black bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition hover:scale-105">
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center border transition hover:bg-blue-500/10"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              {mobileNav ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileNav && (
          <div className="md:hidden mt-3 border-t pt-3 flex flex-col gap-1" style={{ borderColor: 'var(--border)' }}>
            {[
              { href: '/phones', icon: '📱', label: 'Phones' },
              { href: '/laptops', icon: '💻', label: 'Laptops' },
              { href: '/assistant', icon: '🤖', label: 'Assistant' },
              { href: '/contact', icon: '✉️', label: 'Contact' },
              { href: '/about', icon: 'ℹ️', label: 'About' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                onClick={() => setMobileNav(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-500/10 hover:text-blue-400 transition"
                style={{ color: 'var(--text2)' }}>
                {item.icon} {item.label}
              </Link>
            ))}
            <div className="flex gap-3 px-3 pt-2 border-t mt-1" style={{ borderColor: 'var(--border)' }}>
              {[
                { icon: '📸', href: 'https://instagram.com', color: 'text-pink-400' },
                { icon: '𝕏', href: 'https://twitter.com', color: 'text-sky-400' },
                { icon: '👥', href: 'https://facebook.com', color: 'text-blue-400' },
              ].map(s => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`text-xl hover:scale-110 transition-transform ${s.color}`}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}