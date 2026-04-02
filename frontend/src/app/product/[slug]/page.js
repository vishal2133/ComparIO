'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import PriceAlertForm from '@/components/PriceAlertForm';
import PersonalizedSummary from '@/components/PersonalizedSummary';
import Smarty from '@/components/Smarty';

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
      bg: 'amazon-card',
      btn: 'amazon-btn',
      name: 'Amazon',
      icon: '🛒',
    };
    return {
      bg: 'flipkart-card',
      btn: 'flipkart-btn',
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
      <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', opacity: 0.4 }}>
            <div style={{ background: 'var(--surface)', borderRadius: '16px', height: '380px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--surface)', borderRadius: '8px', height: '16px', width: '40%' }} />
              <div style={{ background: 'var(--surface)', borderRadius: '8px', height: '32px', width: '75%' }} />
              <div style={{ background: 'var(--surface)', borderRadius: '8px', height: '24px', width: '50%' }} />
              <div style={{ background: 'var(--surface)', borderRadius: '12px', height: '120px' }} />
              <div style={{ background: 'var(--surface)', borderRadius: '12px', height: '120px' }} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Product not found</h2>
          <Link href="/" style={{ color: 'var(--accent)', fontWeight: 700 }}>Back to homepage</Link>
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
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* BREADCRUMB */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text3)' }}>
          <Link href="/" style={{ color: 'var(--text3)' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--text3)'}>Home</Link>
          <span>→</span>
          <Link href="/phones" style={{ color: 'var(--text3)' }}>Phones</Link>
          <span>→</span>
          <Link href={`/phones?brand=${product.brand}`} style={{ color: 'var(--text3)' }}>{product.brand}</Link>
          <span>→</span>
          <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

          {/* LEFT — Image */}
          <div>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              position: 'relative',
              minHeight: '280px',
            }}>
              {savings > 0 && (
                <div style={{
                  position: 'absolute', top: '16px', left: '16px',
                  background: '#16a34a', color: '#fff', fontSize: '11px',
                  fontWeight: 900, padding: '4px 10px', borderRadius: '8px',
                }}>
                  SAVE {formatPrice(savings)}
                </div>
              )}
              <button
                onClick={handleShare}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text2)', fontSize: '12px', fontWeight: 700,
                  padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? '✅ Copied!' : '🔗 Share'}
              </button>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', maxHeight: '260px', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* RIGHT — Info */}
          <div>
            {/* Brand + Name */}
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              {product.brand}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)', marginBottom: '8px', lineHeight: 1.25 }}>
              {product.name}
            </h1>

            {/* Storage pills */}
            {product.storage?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {product.storage.map((s) => (
                  <span key={s} style={{
                    fontSize: '11px', fontWeight: 700,
                    background: 'var(--surface)', color: 'var(--text2)',
                    border: '1px solid var(--border)',
                    padding: '4px 12px', borderRadius: '999px',
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Best price banner */}
            <div style={{
              background: 'rgba(22,163,74,0.1)',
              border: '1px solid rgba(22,163,74,0.3)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    🏆 Best Price
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#4ade80' }}>
                    {formatPrice(bestPrice)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#86efac', marginTop: '4px', textTransform: 'capitalize' }}>
                    on {bestPlatform?.platform}
                  </div>
                </div>
                {savings > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>You save vs other platforms</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#4ade80' }}>{formatPrice(savings)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Specs */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Key Specs
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'RAM', value: product.ram },
                  { label: 'Battery', value: product.battery },
                  { label: 'Display', value: product.display },
                  { label: 'Camera', value: product.camera },
                ].filter(s => s.value).map((spec) => (
                  <div key={spec.label} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '12px',
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '2px' }}>{spec.label}</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PRICE COMPARISON TABLE */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', marginBottom: '16px' }}>
            💰 Price Comparison
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedPrices.map((price, index) => {
              const isAmazon = price.platform === 'amazon';
              const isBest = index === 0;
              return (
                <div
                  key={price._id}
                  style={{
                    borderRadius: '16px',
                    border: isBest ? '2px solid rgba(22,163,74,0.5)' : '1px solid var(--border)',
                    padding: '20px 24px',
                    background: isBest
                      ? 'rgba(22,163,74,0.06)'
                      : isAmazon
                        ? 'rgba(251,191,36,0.05)'
                        : 'rgba(59,130,246,0.05)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    {/* Platform info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {isBest && (
                        <span style={{
                          background: '#16a34a', color: '#fff',
                          fontSize: '11px', fontWeight: 900,
                          padding: '3px 10px', borderRadius: '6px',
                        }}>
                          BEST DEAL
                        </span>
                      )}
                      <span style={{ fontSize: '24px' }}>{isAmazon ? '🛒' : '🛍️'}</span>
                      <div>
                        <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: '16px' }}>
                          {isAmazon ? 'Amazon' : 'Flipkart'}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px', color: price.inStock ? '#4ade80' : '#f87171' }}>
                          {price.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                        </div>
                      </div>
                    </div>

                    {/* Price + button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)' }}>
                          {formatPrice(price.price)}
                        </div>
                        {index > 0 && (
                          <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 500 }}>
                            +{formatPrice(price.price - bestPrice)} more expensive
                          </div>
                        )}
                        {index === 0 && savings > 0 && (
                          <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 500 }}>
                            Cheapest option 🏆
                          </div>
                        )}
                      </div>

                      <a
                        href={price.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          const btn = e.currentTarget;
                          btn.textContent = 'Opening...';
                          setTimeout(() => {
                            if (btn) btn.textContent = `Buy on ${isAmazon ? 'Amazon' : 'Flipkart'}`;
                          }, 2000);
                        }}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontWeight: 900,
                          fontSize: '13px',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          cursor: price.inStock ? 'pointer' : 'not-allowed',
                          opacity: price.inStock ? 1 : 0.4,
                          pointerEvents: price.inStock ? 'auto' : 'none',
                          background: isAmazon
                            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                            : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: '#fff',
                          boxShadow: isAmazon
                            ? '0 4px 16px rgba(245,158,11,0.3)'
                            : '0 4px 16px rgba(37,99,235,0.3)',
                          transition: 'all 0.2s',
                        }}
                      >
                        Buy on {isAmazon ? 'Amazon' : 'Flipkart'}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── PERSONALIZED AI SUMMARY ── */}
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', marginBottom: '16px' }}>
              ✨ AI Product Summary
            </h2>
            <PersonalizedSummary slug={product.slug} />
          </div>

          {/* PRICE HISTORY */}
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', marginBottom: '8px' }}>📈 Price History</h2>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px' }}>
              Price tracking starts from when a product is added. History builds up over time.
            </p>
            <PriceHistoryChart slug={product.slug} currentPrices={product.prices} />
          </div>

          {/* PRICE ALERT */}
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', marginBottom: '16px' }}>🔔 Price Drop Alert</h2>
            <PriceAlertForm slug={product.slug} currentBestPrice={bestPrice} />
          </div>

          {/* Last updated */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
              🕐 Prices last updated:{' '}
              {new Date(product.prices[0]?.lastUpdated).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* AFFILIATE DISCLOSURE */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(37,99,235,0.08)',
          border: '1px solid rgba(37,99,235,0.2)',
          borderRadius: '12px',
          padding: '12px 20px',
          fontSize: '12px',
          color: 'var(--text3)',
          textAlign: 'center',
        }}>
          💡 ComparIO earns a small affiliate commission when you buy through our links — at no extra cost to you.
        </div>
      </div>
      {/* Smarty with product context */}
<Smarty context={{ productName: product.name, brand: product.brand, page: 'product' }} />
    </main>
  );
}