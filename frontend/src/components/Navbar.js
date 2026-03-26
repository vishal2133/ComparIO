'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    setSearching(true);
    const timeout = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search?q=${query}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.data || []);
          setOpen(true);
          setSearching(false);
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const formatPrice = (prices) => {
    if (!prices || prices.length === 0) return null;
    const best = Math.min(...prices.map((p) => p.price));
    return '₹' + best.toLocaleString('en-IN');
  };

  const handleSelect = (slug) => {
    setQuery('');
    setResults([]);
    setOpen(false);
    router.push(`/product/${slug}`);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center gap-6">

        {/* LOGO */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-2xl font-black text-blue-600 tracking-tight">
            Compar<span className="text-gray-900">IO</span>
          </span>
        </Link>

        {/* SEARCH BAR */}
        <div className="flex-1 relative" ref={ref}>
          <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 gap-2">
            <span className="text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phones..."
              className="bg-transparent flex-1 outline-none text-sm text-gray-800 placeholder-gray-400"
            />
            {searching && (
              <span className="text-xs text-gray-400">...</span>
            )}
            {query && (
              <button
                onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>

          {/* DROPDOWN */}
          {open && results.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              {results.map((phone) => (
                <button
                  key={phone._id}
                  onClick={() => handleSelect(phone.slug)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition border-b border-gray-50 last:border-0 text-left"
                >
                  <img src={phone.image} alt={phone.name} className="w-9 h-9 object-contain flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{phone.name}</div>
                    <div className="text-xs text-gray-400">{phone.brand}</div>
                  </div>
                  <div className="font-black text-blue-600 text-sm flex-shrink-0">
                    {formatPrice(phone.prices)}
                  </div>
                </button>
              ))}
              <Link
                href={`/phones?q=${query}`}
                onClick={() => setOpen(false)}
                className="block text-center text-xs text-blue-600 font-bold py-3 hover:bg-blue-50 transition"
              >
                See all results for "{query}" →
              </Link>
            </div>
          )}

          {/* NO RESULTS */}
          {open && query && !searching && results.length === 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 px-4 py-4 text-sm text-gray-400 text-center">
              No phones found for "{query}"
            </div>
          )}
        </div>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <Link href="/phones" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition">
            All Phones
          </Link>
          <Link href="/phones?brand=Apple" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition">
            Apple
          </Link>
          <Link href="/phones?brand=Samsung" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition">
            Samsung
          </Link>
        </div>

      </div>
    </nav>
  );
}