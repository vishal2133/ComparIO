'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const BRANDS = ['All', 'Apple', 'ASUS', 'Dell', 'Lenovo', 'HP', 'MSI', 'Acer', 'Samsung'];
const OS_OPTIONS = ['All', 'Windows', 'macOS'];
const USE_CASES = ['All', 'Gaming', 'Student', 'Business', 'Creative', 'Programming'];

function LaptopsContent() {
  const searchParams = useSearchParams();
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBrand, setActiveBrand] = useState(searchParams.get('brand') || 'All');
  const [activeOs, setActiveOs] = useState('All');
  const [activeUse, setActiveUse] = useState('All');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?category=laptop`)
      .then(r => r.json())
      .then(d => { setLaptops(d.data || []); setLoading(false); });
  }, []);

  const getBest = (prices) => Math.min(...prices.map(p => p.price));
  const fmt = (p) => '₹' + p.toLocaleString('en-IN');

  const filtered = laptops
    .filter(p => activeBrand === 'All' || p.brand === activeBrand)
    .filter(p => activeOs === 'All' || (p.os?.toLowerCase().includes(activeOs.toLowerCase())))
    .filter(p => activeUse === 'All' || p.tags?.includes(activeUse.toLowerCase()))
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !budget || getBest(p.prices) <= parseInt(budget))
    .sort((a, b) => {
      if (sort === 'price-asc') return getBest(a.prices) - getBest(b.prices);
      if (sort === 'price-desc') return getBest(b.prices) - getBest(a.prices);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <main className="min-h-screen t-bg t-text">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-2">💻 Laptops</div>
            <h1 className="text-4xl font-black tracking-tight">Find your laptop</h1>
            <p className="t-text2 text-sm mt-1">Best prices across Amazon & Flipkart</p>
          </div>
          <Link href="/assistant?category=laptop"
            className="hidden md:flex items-center gap-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-violet-600/30 transition">
            🤖 Help me choose
          </Link>
        </div>

        {/* FILTERS */}
        <div className="t-surface border t-border rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search laptops..."
              className="t-input border t-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-500/50 t-text placeholder-gray-600 col-span-2 md:col-span-1" />
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
              placeholder="Max budget (₹)"
              className="t-input border t-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-500/50 t-text placeholder-gray-600" />
            <select value={activeOs} onChange={e => setActiveOs(e.target.value)}
              className="t-input border t-border rounded-xl px-4 py-2.5 text-sm outline-none t-text cursor-pointer">
              {OS_OPTIONS.map(o => <option key={o} value={o} className="bg-gray-900">{o === 'All' ? 'All OS' : o}</option>)}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="t-input border t-border rounded-xl px-4 py-2.5 text-sm outline-none t-text cursor-pointer">
              <option value="default" className="bg-gray-900">Sort: Default</option>
              <option value="price-asc" className="bg-gray-900">Price: Low → High</option>
              <option value="price-desc" className="bg-gray-900">Price: High → Low</option>
              <option value="name" className="bg-gray-900">Name: A–Z</option>
            </select>
          </div>

          {/* Brand pills */}
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="text-xs t-text2 font-bold self-center mr-1">Brand:</span>
            {BRANDS.map(b => (
              <button key={b} onClick={() => setActiveBrand(b)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeBrand === b ? 'bg-violet-600 t-text' : 't-input text-gray-500 hover:t-text border t-border'}`}>
                {b}
              </button>
            ))}
          </div>

          {/* Use case pills */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs t-text2 font-bold self-center mr-1">Use:</span>
            {USE_CASES.map(u => (
              <button key={u} onClick={() => setActiveUse(u)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeUse === u ? 'bg-white/20 t-text' : 't-input text-gray-500 hover:t-text border t-border'}`}>
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* COUNT */}
        <div className="text-xs t-text2 mb-5 font-bold">
          {loading ? 'Loading...' : `${filtered.length} laptops found`}
          {(activeBrand !== 'All' || activeOs !== 'All' || activeUse !== 'All' || search || budget) && (
            <button onClick={() => { setActiveBrand('All'); setActiveOs('All'); setActiveUse('All'); setSearch(''); setBudget(''); }}
              className="ml-3 text-violet-400 hover:text-violet-300 transition">Clear filters ×</button>
          )}
        </div>

        {/* GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="t-surface border t-border rounded-2xl p-5 animate-pulse">
                <div className="h-36 t-input rounded-xl mb-4" />
                <div className="h-3 t-input rounded mb-2 w-1/2" />
                <div className="h-4 t-input rounded mb-3 w-3/4" />
                <div className="h-5 t-input rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-3">💻</div>
            <div className="font-bold text-gray-500">No laptops found</div>
            <button onClick={() => { setActiveBrand('All'); setActiveOs('All'); setActiveUse('All'); setSearch(''); setBudget(''); }}
              className="mt-3 text-violet-400 text-sm hover:underline">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(p => {
              const bp = getBest(p.prices);
              const bplatform = p.prices.find(pr => pr.price === bp);
              return (
                <Link key={p._id} href={`/product/${p.slug}`}>
                  <div className="group t-surface border t-border rounded-2xl p-5 hover:bg-white/[0.07] hover:border-violet-500/30 transition-all h-full flex flex-col hover:scale-[1.02]">
                    <div className="t-input rounded-xl p-4 mb-4 flex items-center justify-center h-36">
                      <img src={p.image} alt={p.name} className="h-full object-contain" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs t-text2">{p.brand}</span>
                      {p.os && <span className="text-xs t-input t-text2 px-2 py-0.5 rounded-full">{p.os}</span>}
                    </div>
                    <div className="font-black t-text text-sm leading-tight mb-1 flex-1">{p.name}</div>
                    {p.processor && <div className="text-xs t-text2 mb-1 truncate">{p.processor}</div>}
                    {p.ram && <div className="text-xs t-text2 mb-3">{p.ram} · {p.weight}</div>}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div>
                        <div className="text-xs t-text2">Best price</div>
                        <div className="text-lg font-black text-violet-400">{fmt(bp)}</div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${bplatform?.platform === 'amazon' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {bplatform?.platform}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function LaptopsPage() {
  return <Suspense><LaptopsContent /></Suspense>;
}