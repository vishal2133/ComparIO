'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setNotFound(true);
        } else {
          setProduct(data.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');
  const getBestPrice = (prices) => Math.min(...prices.map((p) => p.price));

  const getPlatformColor = (platform) => {
    if (platform === 'amazon') return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
    if (platform === 'flipkart') return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    return 'bg-gray-50 border-gray-200';
  };

  const getButtonColor = (platform) => {
    if (platform === 'amazon') return 'bg-yellow-400 hover:bg-yellow-500 text-gray-900';
    if (platform === 'flipkart') return 'bg-blue-600 hover:bg-blue-700 text-white';
    return 'bg-gray-600 text-white';
  };

  const sortedPrices = (prices) => [...prices].sort((a, b) => a.price - b.price);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-500 font-medium">Loading product...</div>
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
          <Link href="/" className="text-blue-600 font-bold hover:underline">
            Back to homepage
          </Link>
        </div>
      </main>
    );
  }

  const bestPrice = getBestPrice(product.prices);
  const bestPlatform = product.prices.find((p) => p.price === bestPrice);

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-black text-blue-600 tracking-tight cursor-pointer">
              Compar<span className="text-gray-900">IO</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 font-medium">
            Back to search
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-h-80 object-contain"
            />
          </div>

          <div>
            <div className="text-sm text-blue-600 font-bold mb-1">{product.brand}</div>
            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
              {product.name}
            </h1>

            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2 mb-6">
              <span className="text-green-600 text-xs font-bold uppercase">Best Price</span>
              <span className="text-2xl font-black text-green-700">
                {formatPrice(bestPrice)}
              </span>
              <span className="text-xs text-green-500 capitalize">
                on {bestPlatform?.platform}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-black text-gray-900 mb-3 text-sm uppercase tracking-wide">
                Key Specs
              </h3>
              <div className="grid grid-cols-2 gap-y-3">
                {product.storage?.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400">Storage</div>
                    <div className="text-sm font-bold text-gray-900">
                      {product.storage.join(' / ')}
                    </div>
                  </div>
                )}
                {product.ram && (
                  <div>
                    <div className="text-xs text-gray-400">RAM</div>
                    <div className="text-sm font-bold text-gray-900">{product.ram}</div>
                  </div>
                )}
                {product.display && (
                  <div>
                    <div className="text-xs text-gray-400">Display</div>
                    <div className="text-sm font-bold text-gray-900">{product.display}</div>
                  </div>
                )}
                {product.camera && (
                  <div>
                    <div className="text-xs text-gray-400">Camera</div>
                    <div className="text-sm font-bold text-gray-900">{product.camera}</div>
                  </div>
                )}
                {product.battery && (
                  <div>
                    <div className="text-xs text-gray-400">Battery</div>
                    <div className="text-sm font-bold text-gray-900">{product.battery}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-black text-gray-900 mb-4">
            Price Comparison
          </h2>

          <div className="flex flex-col gap-3">
            {sortedPrices(product.prices).map((price, index) => (
              <div
                key={price._id}
                className={`flex items-center justify-between rounded-2xl border px-6 py-5 transition ${getPlatformColor(price.platform)}`}
              >
                <div className="flex items-center gap-4">
                  {index === 0 && (
                    <span className="bg-green-500 text-white text-xs font-black px-2 py-1 rounded-lg">
                      BEST DEAL
                    </span>
                  )}
                  <div>
                    <div className="font-black text-gray-900 capitalize text-lg">
                      {price.platform}
                    </div>
                    <div className="text-xs text-gray-400">
                      {price.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-black text-gray-900">
                      {formatPrice(price.price)}
                    </div>
                    {index > 0 && (
                      <div className="text-xs text-red-400 font-medium">
                        +{formatPrice(price.price - bestPrice)} more
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
                    if (btn) btn.textContent = `Buy on ${price.platform.charAt(0).toUpperCase() + price.platform.slice(1)}`;
                  }, 2000);
                }}
                    className={`px-6 py-3 rounded-xl font-black text-sm transition ${getButtonColor(price.platform)} ${!price.inStock ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                    Buy on {price.platform.charAt(0).toUpperCase() + price.platform.slice(1)}
                    </a>
                </div>
                </div>
              
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Prices last updated:{' '}
            {new Date(product.prices[0]?.lastUpdated).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </main>
);
}
