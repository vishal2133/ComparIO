'use client';
import { useState, useEffect } from 'react';

export default function PriceHistoryChart({ slug, currentPrices }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/${slug}`)
      .then((r) => r.json())
      .then((d) => { setHistory(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const formatPrice = (p) => '₹' + p.toLocaleString('en-IN');

  // Group history by platform
  const platforms = ['amazon', 'flipkart'];
  const colors = { amazon: '#f59e0b', flipkart: '#2563eb' };

  // If no history yet, show current prices as a placeholder
  if (!loading && history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-center py-6">
          <div className="text-3xl mb-3">📊</div>
          <div className="font-bold text-gray-700 mb-1">No history yet</div>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Price history will appear here after our scraper runs a few cycles. Check back in 24 hours!
          </p>
          {/* Show current prices */}
          <div className="flex justify-center gap-4 mt-5">
            {currentPrices.map((p) => (
              <div key={p.platform} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <div className="text-xs text-gray-400 capitalize mb-1">{p.platform} today</div>
                <div className={`text-lg font-black ${p.platform === 'amazon' ? 'text-amber-500' : 'text-blue-600'}`}>
                  {formatPrice(p.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Simple SVG chart when data exists
  const allPrices = history.map((h) => h.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  const chartWidth = 600;
  const chartHeight = 160;
  const padding = 40;

  const getX = (index, total) =>
    padding + (index / (total - 1)) * (chartWidth - padding * 2);
  const getY = (price) =>
    chartHeight - padding - ((price - minPrice) / priceRange) * (chartHeight - padding * 2);

  const amazonHistory = history.filter((h) => h.platform === 'amazon');
  const flipkartHistory = history.filter((h) => h.platform === 'flipkart');

  const buildPath = (data) => {
    if (data.length < 2) return '';
    return data
      .map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(i, data.length)} ${getY(h.price)}`)
      .join(' ');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Legend */}
      <div className="flex gap-4 mb-4">
        {platforms.map((p) => (
          <div key={p} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: colors[p] }} />
            <span className="text-xs font-bold text-gray-600 capitalize">{p}</span>
          </div>
        ))}
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[300px]">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padding + t * (chartHeight - padding * 2);
            const price = maxPrice - t * priceRange;
            return (
              <g key={t}>
                <line x1={padding} y1={y} x2={chartWidth - padding} y2={y}
                  stroke="#f3f4f6" strokeWidth="1" />
                <text x={padding - 5} y={y + 4} textAnchor="end"
                  fontSize="9" fill="#9ca3af">
                  {formatPrice(Math.round(price))}
                </text>
              </g>
            );
          })}

          {/* Amazon line */}
          {amazonHistory.length > 1 && (
            <path d={buildPath(amazonHistory)} fill="none"
              stroke={colors.amazon} strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* Flipkart line */}
          {flipkartHistory.length > 1 && (
            <path d={buildPath(flipkartHistory)} fill="none"
              stroke={colors.flipkart} strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* Dots */}
          {[...amazonHistory.map(h => ({ ...h, platform: 'amazon' })),
            ...flipkartHistory.map(h => ({ ...h, platform: 'flipkart' }))].map((h, i) => (
            <circle key={i}
              cx={getX(i % (h.platform === 'amazon' ? amazonHistory.length : flipkartHistory.length),
                h.platform === 'amazon' ? amazonHistory.length : flipkartHistory.length)}
              cy={getY(h.price)}
              r="3" fill={colors[h.platform]} />
          ))}
        </svg>
      </div>

      <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
        <span>{history.length > 0 ? new Date(history[0].recordedAt).toLocaleDateString('en-IN') : ''}</span>
        <span>Today</span>
      </div>
    </div>
  );
}