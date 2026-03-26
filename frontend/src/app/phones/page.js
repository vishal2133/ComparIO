'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const BRANDS = ['All', 'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'iQOO', 'Nothing', 'Google'];

function PhonesContent() {
  const searchParams = useSearchParams();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBrand, setActiveBrand] = useState(searchParams.get('brand') || 'All');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState(searchParams.get('q') || '');

  useEffect(() => {
  setLoading(true);
  const url = activeBrand && activeBrand !== 'All'
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/products?brand=${activeBrand}`
    : `${process.env.NEXT_PUBLIC_API_URL}/api/products`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  fetch(url, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => {
      setPhones(data.data || []);
      setLoading(false);
      clearTimeout(timeout);
    })
    .catch((err) => {
      if (err.name !== 'AbortError') console.error(err);
      setLoading(false);
      clearTimeout(timeout);
    });

  return () => { controller.abort(); clearTimeout(timeout); };
}, [activeBrand]);

  const getBestPrice = (prices) => Math.min(...prices.map((p) => p.price));
  const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');

  const filtered = phones
    .filter((p) => search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      : true
    )
    .sort((a, b) => {
      if (sort === 'price-asc') return getBestPrice(a.prices) - getBestPrice(b.prices);
      if (sort === 'price-desc') return getBestPrice(b.prices) - getBestPrice(a.prices);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">All Phones</h1>
          <p className="text-gray-500 text-sm">Compare prices across Amazon & Flipkart</p>
        </div>

        {/* FILTERS ROW */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* SEARCH */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name..."
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 flex-1"
          />
          {/* SORT */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>

        {/* BRAND FILTERS */}
        <div className="flex gap-2 flex-wrap mb-8">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => setActiveBrand(brand)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeBrand === brand
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* RESULTS COUNT */}
        <div className="text-xs text-gray-400 mb-5 font-medium">
          {loading ? 'Loading...' : `${filtered.length} phones found`}
        </div>

        {/* PHONES GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                <div className="w-full h-36 bg-gray-100 rounded-xl mb-4" />
                <div className="h-3 bg-gray-100 rounded mb-2 w-1/2" />
                <div className="h-4 bg-gray-100 rounded mb-3 w-3/4" />
                <div className="h-6 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">😕</div>
            <div className="font-bold">No phones found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((phone) => {
              const best = getBestPrice(phone.prices);
              const bestPlatform = phone.prices.find((p) => p.price === best);
              return (
                <Link key={phone._id} href={`/product/${phone.slug}`}>
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition cursor-pointer h-full flex flex-col">
                    <img
                      src={phone.image}
                      alt={phone.name}
                      className="w-full h-36 object-contain mb-4"
                    />
                    <div className="text-xs text-gray-400 font-medium mb-1">{phone.brand}</div>
                    <div className="font-black text-gray-900 mb-1 text-sm leading-tight flex-1">
                      {phone.name}
                    </div>
                    {phone.storage?.length > 0 && (
                      <div className="text-xs text-gray-400 mb-3">
                        {phone.storage.join(' · ')}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <div className="text-xs text-gray-400">Best price</div>
                        <div className="text-lg font-black text-blue-600">
                          {formatPrice(best)}
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${
                        bestPlatform?.platform === 'amazon'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {bestPlatform?.platform}
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
  return (
    <Suspense>
      <PhonesContent />
    </Suspense>
  );
}