'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import PriceAlertForm from '@/components/PriceAlertForm';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) setNotFound(true);
        else setProduct(data.data);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');
  const getBestPrice = (prices) => Math.min(...prices.map((p) => p.price));
  const getDiscount = (price, best) => Math.round(((price - best) / price) * 100);

  const getPlatformStyle = (platform) => {
    if (platform === 'amazon') return {
      bg: 'bg-amber-50 border-amber-200',
      btn: 'bg-amber-400 hover:bg-amber-500 text-gray-900',
      badge: 'bg-amber-100 text-amber-700',
      name: 'Amazon',
      icon: '🛒',
    };
    return {
      bg: 'bg-blue-50 border-blue-200',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      badge: 'bg-blue-100 text-blue-700',
      name: 'Flipkart',
      icon: '🛍️',
    };
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen t-bg t-text">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-96" />
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6" />
              <div className="h-32 bg-gray-200 rounded mb-4" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Product not found</h2>
          <Link href="/" className="text-blue-600 font-bold hover:underline">Back to homepage</Link>
        </div>
      </main>
    );
  }

  const bestPrice = getBestPrice(product.prices);
  const bestPlatform = product.prices.find((p) => p.price === bestPrice);
  const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price);
  const savings = product.prices.length > 1
    ? Math.max(...product.prices.map((p) => p.price)) - bestPrice
    : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* BREADCRUMB */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>→</span>
          <Link href="/phones" className="hover:text-blue-600">Phones</Link>
          <span>→</span>
          <Link href={`/phones?brand=${product.brand}`} className="hover:text-blue-600">{product.brand}</Link>
          <span>→</span>
          <span className="text-gray-600 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* LEFT — Image */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center mb-3 relative">
              {savings > 0 && (
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-black px-2 py-1 rounded-lg">
                  SAVE {formatPrice(savings)}
                </div>
              )}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
              >
                {copied ? '✅ Copied!' : '🔗 Share'}
              </button>
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-h-72 object-contain"
              />
            </div>
          </div>

          {/* RIGHT — Info */}
          <div>
            {/* Brand + Name */}
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              {product.brand}
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Storage pills */}
            {product.storage?.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {product.storage.map((s) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full border border-gray-200">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Best price banner */}
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1">
                    🏆 Best Price
                  </div>
                  <div className="text-3xl font-black text-green-700">
                    {formatPrice(bestPrice)}
                  </div>
                  <div className="text-xs text-green-500 mt-1 capitalize">
                    on {bestPlatform?.platform}
                  </div>
                </div>
                {savings > 0 && (
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">You save vs other platforms</div>
                    <div className="text-xl font-black text-green-600">{formatPrice(savings)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                Key Specs
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'RAM', value: product.ram },
                  { label: 'Battery', value: product.battery },
                  { label: 'Display', value: product.display },
                  { label: 'Camera', value: product.camera },
                ].filter(s => s.value).map((spec) => (
                  <div key={spec.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-0.5">{spec.label}</div>
                    <div className="text-xs font-bold text-gray-900 leading-snug">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PRICE COMPARISON TABLE */}
        <div className="mt-10">
          <h2 className="text-xl font-black text-gray-900 mb-4">
            💰 Price Comparison
          </h2>

          <div className="flex flex-col gap-3">
            {sortedPrices.map((price, index) => {
              const style = getPlatformStyle(price.platform);
              return (
                <div
                  key={price._id}
                  className={`rounded-2xl border-2 px-6 py-5 transition ${style.bg} ${index === 0 ? 'border-green-300' : ''}`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Platform info */}
                    <div className="flex items-center gap-3">
                      {index === 0 && (
                        <span className="bg-green-500 text-white text-xs font-black px-2 py-1 rounded-lg">
                          BEST DEAL
                        </span>
                      )}
                      <span className="text-2xl">{style.icon}</span>
                      <div>
                        <div className="font-black text-gray-900 text-lg">{style.name}</div>
                        <div className={`text-xs font-bold mt-0.5 ${price.inStock ? 'text-green-600' : 'text-red-500'}`}>
                          {price.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                        </div>
                      </div>
                    </div>

                    {/* Price + button */}
                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <div className="text-2xl font-black text-gray-900">
                          {formatPrice(price.price)}
                        </div>
                        {index > 0 && (
                          <div className="text-xs text-red-400 font-medium">
                            +{formatPrice(price.price - bestPrice)} more expensive
                          </div>
                        )}
                        {index === 0 && savings > 0 && (
                          <div className="text-xs text-green-500 font-medium">
                            Cheapest option 🏆
                          </div>
                        )}
                      </div>
                      
                        <a href={price.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          const btn = e.currentTarget;
                          btn.textContent = 'Opening...';
                          setTimeout(() => {
                            if (btn) btn.textContent = `Buy on ${style.name}`;
                          }, 2000);
                        }}
                        className={`px-6 py-3 rounded-xl font-black text-sm transition whitespace-nowrap ${style.btn} ${!price.inStock ? 'opacity-40 pointer-events-none' : ''}`}
                      >
                        Buy on {style.name}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
            {/* PRICE HISTORY */}
          <div className="mt-10">
            <h2 className="text-xl font-black text-gray-900 mb-2">📈 Price History</h2>
            <p className="text-xs text-gray-400 mb-4">
              Price tracking starts from when a product is added. History builds up over time.
            </p>
            <PriceHistoryChart slug={product.slug} currentPrices={product.prices} />
          </div>

          {/* PRICE ALERT */}
          <div className="mt-10">
            <h2 className="text-xl font-black text-gray-900 mb-4">🔔 Price Drop Alert</h2>
            <PriceAlertForm slug={product.slug} currentBestPrice={bestPrice} />
          </div>
          {/* Last updated */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-xs text-gray-400">
              🕐 Prices last updated:{' '}
              {new Date(product.prices[0]?.lastUpdated).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* AFFILIATE DISCLOSURE */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 text-xs text-blue-500 text-center">
          💡 ComparIO earns a small affiliate commission when you buy through our links — at no extra cost to you.
        </div>
      </div>
    </main>
  );
}