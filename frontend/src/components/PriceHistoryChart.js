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

  const platforms = ['amazon', 'flipkart'];
  const colors = { amazon: '#f59e0b', flipkart: '#3b82f6' };

  const containerStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '24px',
  };

  if (!loading && history.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontWeight: 700, color: 'var(--text2)', marginBottom: '4px' }}>No history yet</div>
          <p style={{ fontSize: '12px', color: 'var(--text3)', maxWidth: '280px', margin: '0 auto' }}>
            Price history will appear here after our scraper runs a few cycles. Check back in 24 hours!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
            {currentPrices.map((p) => (
              <div key={p.platform} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px 16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'capitalize', marginBottom: '4px' }}>
                  {p.platform} today
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: colors[p.platform] || 'var(--text)' }}>
                  {formatPrice(p.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const allPrices = history.map((h) => h.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  const chartWidth = 600;
  const chartHeight = 160;
  const padding = 40;

  const getX = (index, total) =>
    total <= 1 
      ? padding + (chartWidth - padding * 2) / 2 
      : padding + (index / (total - 1)) * (chartWidth - padding * 2);
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
    <div style={containerStyle}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {platforms.map((p) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors[p] }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text2)', textTransform: 'capitalize' }}>{p}</span>
          </div>
        ))}
      </div>

      {/* SVG Chart */}
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', minWidth: '300px' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padding + t * (chartHeight - padding * 2);
            const price = maxPrice - t * priceRange;
            return (
              <g key={t}>
                <line x1={padding} y1={y} x2={chartWidth - padding} y2={y}
                  stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x={padding - 5} y={y + 4} textAnchor="end"
                  fontSize="9" fill="rgba(255,255,255,0.3)">
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

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text3)', marginTop: '8px', padding: '0 4px' }}>
        <span>{history.length > 0 ? new Date(history[0].recordedAt).toLocaleDateString('en-IN') : ''}</span>
        <span>Today</span>
      </div>
    </div>
  );
}