'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?featured=true`)
      .then((res) => res.json())
      .then((data) => setFeatured(data.data || []));
  }, []);

  const getBestPrice = (prices) => Math.min(...prices.map((p) => p.price));
  const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="bg-blue-600 text-white px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block bg-blue-500 text-blue-100 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            🇮🇳 India's Price Comparison Platform
          </div>
          <h2 className="text-4xl font-black mb-3 tracking-tight leading-tight">
            Find the best price<br />for any phone
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Compare prices across Amazon & Flipkart instantly
          </p>
          <Link
            href="/phones"
            className="inline-block bg-white text-blue-600 font-black px-8 py-4 rounded-2xl text-lg hover:bg-blue-50 transition shadow-lg"
          >
            Browse All Phones →
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <h3 className="text-xl font-black text-gray-900 mb-8 text-center">How ComparIO works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🔍', title: 'Search', desc: 'Search for any phone by name or brand' },
            { icon: '💰', title: 'Compare', desc: 'See prices from Amazon & Flipkart side by side' },
            { icon: '🛒', title: 'Buy', desc: 'Click through to the cheapest option and save money' },
          ].map((step) => (
            <div key={step.title} className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-3">{step.icon}</div>
              <div className="font-black text-gray-900 mb-2">{step.title}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PHONES */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900">🔥 Featured Phones</h3>
          <Link href="/phones" className="text-sm text-blue-600 font-bold hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {featured.map((phone) => (
            <Link key={phone._id} href={`/product/${phone.slug}`}>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition cursor-pointer">
                <img src={phone.image} alt={phone.name} className="w-full h-36 object-contain mb-4" />
                <div className="text-xs text-gray-400 font-medium mb-1">{phone.brand}</div>
                <div className="font-black text-gray-900 mb-3 text-sm">{phone.name}</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Best price</div>
                    <div className="text-lg font-black text-blue-600">
                      {phone.prices?.length > 0 ? formatPrice(getBestPrice(phone.prices)) : '—'}
                    </div>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full">
                    Compare →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}