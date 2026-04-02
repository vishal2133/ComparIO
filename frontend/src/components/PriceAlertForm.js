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

  const inputStyle = {
    width: '100%',
    background: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  if (status === 'success') {
    return (
      <div style={{
        background: 'rgba(22,163,74,0.1)',
        border: '1px solid rgba(22,163,74,0.3)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
        <div style={{ fontWeight: 900, color: '#4ade80', marginBottom: '4px' }}>Alert Set!</div>
        <p style={{ fontSize: '14px', color: 'var(--text2)' }}>
          We'll email you at <strong style={{ color: 'var(--text)' }}>{email}</strong> when the price drops to{' '}
          <strong style={{ color: '#4ade80' }}>{formatPrice(parseInt(targetPrice))}</strong>.
        </p>
        <button
          onClick={() => setStatus(null)}
          style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Set another alert
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '20px' }}>
        Current best price is <strong style={{ color: 'var(--text)' }}>{formatPrice(currentBestPrice)}</strong>.
        {' '}We'll notify you when it drops to your target.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>
            Your Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>
            Target Price (₹)
          </label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder={`e.g. ${Math.round(currentBestPrice * 0.9).toLocaleString('en-IN')}`}
            style={inputStyle}
          />
          {targetPrice && parseInt(targetPrice) < currentBestPrice && (
            <p style={{ fontSize: '12px', color: '#4ade80', marginTop: '4px' }}>
              You'll save {formatPrice(currentBestPrice - parseInt(targetPrice))} from current price 🎯
            </p>
          )}
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="any">Any Platform</option>
            <option value="amazon">Amazon only</option>
            <option value="flipkart">Flipkart only</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!email || !targetPrice || loading}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff',
            fontWeight: 900,
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            cursor: (!email || !targetPrice || loading) ? 'not-allowed' : 'pointer',
            opacity: (!email || !targetPrice || loading) ? 0.4 : 1,
            fontSize: '14px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 16px rgba(37,99,235,0.25)',
          }}
        >
          {loading ? 'Setting alert...' : '🔔 Set Price Alert'}
        </button>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', marginTop: '12px' }}>
        Free. No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}