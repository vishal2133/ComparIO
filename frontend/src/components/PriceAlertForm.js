'use client';
import { useState } from 'react';

export default function PriceAlertForm({ slug, currentBestPrice }) {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [platform, setPlatform] = useState('any');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatPrice = (p) => '₹' + p.toLocaleString('en-IN');

  const handleSubmit = async () => {
    if (!email || !targetPrice) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, slug, targetPrice: parseInt(targetPrice), platform }),
      });
      const data = await res.json();
      if (data.success) setStatus('success');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
    setLoading(false);
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <div className="font-black text-green-700 mb-1">Alert Set!</div>
        <p className="text-sm text-green-600">
          We'll email you at <strong>{email}</strong> when the price drops to{' '}
          <strong>{formatPrice(parseInt(targetPrice))}</strong>.
        </p>
        <button onClick={() => setStatus(null)} className="mt-3 text-xs text-green-500 hover:underline">
          Set another alert
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-5">
        Current best price is <strong className="text-gray-900">{formatPrice(currentBestPrice)}</strong>.
        We'll notify you when it drops to your target.
      </p>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">Your Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">Target Price (₹)</label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder={`e.g. ${Math.round(currentBestPrice * 0.9).toLocaleString('en-IN')}`}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
          />
          {targetPrice && parseInt(targetPrice) < currentBestPrice && (
            <p className="text-xs text-green-600 mt-1">
              You'll save {formatPrice(currentBestPrice - parseInt(targetPrice))} from current price 🎯
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
          >
            <option value="any">Any Platform</option>
            <option value="amazon">Amazon only</option>
            <option value="flipkart">Flipkart only</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!email || !targetPrice || loading}
          className="w-full bg-blue-600 text-white font-black py-3.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting alert...' : '🔔 Set Price Alert'}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-3">
        Free. No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}