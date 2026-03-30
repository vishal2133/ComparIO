'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const BRANDS = ['All', 'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Nothing', 'iQOO', 'Vivo', 'Google', 'Oppo', 'Motorola', 'Poco'];
const OS_OPTIONS = ['All', 'Android', 'iOS'];
const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Name: A–Z', value: 'name' },
];
const BUDGET_RANGES = [
  { label: 'All budgets', value: '' },
  { label: 'Under ₹15K', value: '15000' },
  { label: 'Under ₹30K', value: '30000' },
  { label: 'Under ₹60K', value: '60000' },
  { label: 'Under ₹1L', value: '100000' },
];

function PhonesContent() {
  const searchParams = useSearchParams();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBrand, setActiveBrand] = useState(searchParams.get('brand') || 'All');
  const [activeOs, setActiveOs] = useState('All');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [budgetCap, setBudgetCap] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?category=phone`)
      .then(r => r.json())
      .then(d => { setPhones(d.data || []); setLoading(false); });
  }, []);

  const getBest = (prices) => Math.min(...prices.map(p => p.price));
  const fmt = (p) => '₹' + p.toLocaleString('en-IN');

  const filtered = phones
    .filter(p => activeBrand === 'All' || p.brand === activeBrand)
    .filter(p => activeOs === 'All' || p.os?.toLowerCase() === activeOs.toLowerCase())
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !budgetCap || getBest(p.prices) <= parseInt(budgetCap))
    .sort((a, b) => {
      if (sort === 'price-asc') return getBest(a.prices) - getBest(b.prices);
      if (sort === 'price-desc') return getBest(b.prices) - getBest(a.prices);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const clearAll = () => { setActiveBrand('All'); setActiveOs('All'); setSearch(''); setBudgetCap(''); };
  const hasFilters = activeBrand !== 'All' || activeOs !== 'All' || search || budgetCap;

  return (
    <main className="min-h-screen t-bg t-text">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">📱 Phones</div>
            <h1 className="text-4xl font-black tracking-tight">Find your phone</h1>
            <p className="t-text2 text-sm mt-1">Best prices across Amazon & Flipkart</p>
          </div>
          <Link href="/assistant"
            className="hidden md:flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-blue-600/30 transition">
            🤖 Help me choose
          </Link>
        </div>

        {/* FILTERS */}
        <div className="t-surface border t-border rounded-2xl p-5 mb-6">
          {/* Top row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search phones..."
              className="t-input border t-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 t-text placeholder-gray-600 col-span-2 md:col-span-1" />
            <select value={budgetCap} onChange={e => setBudgetCap(e.target.value)}
              className="t-input border t-border rounded-xl px-4 py-2.5 text-sm outline-none t-text cursor-pointer">
              {BUDGET_RANGES.map(b => <option key={b.value} value={b.value} className="bg-gray-900">{b.label}</option>)}
            </select>
            <select value={activeOs} onChange={e => setActiveOs(e.target.value)}
              className="t-input border t-border rounded-xl px-4 py-2.5 text-sm outline-none t-text cursor-pointer">
              {OS_OPTIONS.map(o => <option key={o} value={o} className="bg-gray-900">{o === 'All' ? 'All OS' : o}</option>)}
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="t-input border t-border rounded-xl px-4 py-2.5 text-sm outline-none t-text cursor-pointer">
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-gray-900">{s.label}</option>)}
            </select>
          </div>

          {/* Brand pills */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs t-text2 font-bold self-center mr-1">Brand:</span>
            {BRANDS.map(b => (
              <button key={b} onClick={() => setActiveBrand(b)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${activeBrand === b ? 'bg-blue-600 t-text' : 't-input text-gray-500 hover:t-text border t-border'}`}>
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* COUNT + CLEAR */}
        <div className="text-xs t-text2 mb-5 font-bold flex items-center gap-3">
          <span>{loading ? 'Loading...' : `${filtered.length} phones found`}</span>
          {hasFilters && (
            <button onClick={clearAll} className="text-blue-400 hover:text-blue-300 transition">
              Clear filters ×
            </button>
          )}
        </div>

        {/* GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
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
            <div className="text-4xl mb-3">📱</div>
            <div className="font-bold text-gray-500">No phones found</div>
            <button onClick={clearAll} className="mt-3 text-blue-400 text-sm hover:underline">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map(p => {
              const bp = getBest(p.prices);
              const bplatform = p.prices.find(pr => pr.price === bp);
              return (
                <Link key={p._id} href={`/product/${p.slug}`}>
                  <div className="group t-surface border t-border rounded-2xl p-4 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all h-full flex flex-col hover:scale-[1.02]">
                    <div className="t-input rounded-xl p-3 mb-3 flex items-center justify-center h-32">
                      <img src={p.image} alt={p.name} className="h-full object-contain" />
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs t-text2">{p.brand}</span>
                      {p.os && <span className="text-xs t-input t-text3 px-1.5 py-0.5 rounded-full text-[10px]">{p.os}</span>}
                    </div>
                    <div className="font-black t-text text-sm leading-tight mb-2 flex-1">{p.name}</div>
                    {p.storage?.length > 0 && (
                      <div className="text-[10px] t-text3 mb-2">{p.storage.slice(0, 2).join(' · ')}</div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div>
                        <div className="text-[10px] t-text3">Best price</div>
                        <div className="text-base font-black text-blue-400">{fmt(bp)}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg capitalize ${bplatform?.platform === 'amazon' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-300'}`}>
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

export default function PhonesPage() {
  return <Suspense><PhonesContent /></Suspense>;
}