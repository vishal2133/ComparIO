'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [platform, setPlatform] = useState('any');
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('compario_token') : null;

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAlerts(data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search?q=${search}`)
        .then(r => r.json())
        .then(d => setSearchResults(d.data || []));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleAddAlert = async () => {
    if (!selectedProduct || !targetPrice) return showMsg('error', 'Select a product and set a target price');
    setAdding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slug: selectedProduct.slug, targetPrice, platform }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', data.message);
        setSelectedProduct(null);
        setTargetPrice('');
        setSearch('');
        fetchAlerts();
      } else {
        showMsg('error', data.message);
      }
    } catch { showMsg('error', 'Failed. Try again.'); }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/alerts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(prev => prev.filter(a => a._id !== id));
      showMsg('success', 'Alert removed');
    } catch { showMsg('error', 'Failed to remove'); }
  };

  const fmt = (p) => '₹' + Number(p).toLocaleString('en-IN');
  const activeAlerts = alerts.filter(a => !a.isTriggered);
  const triggeredAlerts = alerts.filter(a => a.isTriggered);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>🔔 My Alerts</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Get notified when prices drop to your target</p>
      </div>

      {msg.text && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border animate-slide-up"
          style={{
            background: msg.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            borderColor: msg.type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)',
            color: msg.type === 'success' ? '#34d399' : '#f87171',
          }}>
          {msg.text}
        </div>
      )}

      {/* ADD ALERT FORM */}
      <div className="rounded-3xl border p-6 mb-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h3 className="font-black mb-4" style={{ color: 'var(--text)' }}>+ Set New Alert</h3>

        {/* Product search */}
        <div className="relative mb-3">
          <input value={search} onChange={e => { setSearch(e.target.value); setSelectedProduct(null); }}
            placeholder="Search for a phone or laptop..."
            style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '12px', padding: '11px 14px', fontSize: '14px', outline: 'none' }} />
          {searchResults.length > 0 && !selectedProduct && (
            <div className="absolute top-12 left-0 right-0 rounded-2xl shadow-2xl border z-50 overflow-hidden"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
              {searchResults.slice(0, 4).map(p => (
                <button key={p._id} onClick={() => {
                  setSelectedProduct(p);
                  setSearch(p.name);
                  setSearchResults([]);
                  const best = Math.min(...p.prices.map(pr => pr.price));
                  setTargetPrice(Math.round(best * 0.9).toString());
                }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition border-b last:border-0 text-left"
                  style={{ borderColor: 'var(--border)' }}>
                  <img src={p.image} alt={p.name} className="w-8 h-8 object-contain" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate" style={{ color: 'var(--text)' }}>{p.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text3)' }}>{p.brand}</div>
                  </div>
                  <div className="font-black text-blue-400 text-xs">
                    {fmt(Math.min(...p.prices.map(pr => pr.price)))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected product preview */}
        {selectedProduct && (
          <div className="flex items-center gap-3 p-3 rounded-xl mb-3 border"
            style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-10 h-10 object-contain" />
            <div className="flex-1">
              <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{selectedProduct.name}</div>
              <div className="text-xs" style={{ color: 'var(--text3)' }}>
                Current best: {fmt(Math.min(...selectedProduct.prices.map(p => p.price)))}
              </div>
            </div>
            <button onClick={() => { setSelectedProduct(null); setSearch(''); }}
              style={{ color: 'var(--text3)' }}>×</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>
              Target Price (₹)
            </label>
            <input type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)}
              placeholder="e.g. 65000"
              style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '12px', padding: '11px 14px', fontSize: '14px', outline: 'none' }} />
            {selectedProduct && targetPrice && (
              <p className="text-xs mt-1 text-emerald-400">
                Save {fmt(Math.min(...selectedProduct.prices.map(p => p.price)) - parseInt(targetPrice))} from current price
              </p>
            )}
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>
              Platform
            </label>
            <select value={platform} onChange={e => setPlatform(e.target.value)}
              style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '12px', padding: '11px 14px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
              <option value="any">Any Platform</option>
              <option value="amazon">Amazon only</option>
              <option value="flipkart">Flipkart only</option>
            </select>
          </div>
        </div>

        <button onClick={handleAddAlert} disabled={adding || !selectedProduct || !targetPrice}
          className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-40"
          style={{ background: 'var(--accent)' }}>
          {adding ? 'Setting alert...' : '🔔 Set Price Alert · Earn +5 Coins'}
        </button>
      </div>

      {/* ACTIVE ALERTS */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black" style={{ color: 'var(--text)' }}>
            Active Alerts <span className="text-blue-400 ml-1">({activeAlerts.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="rounded-2xl border p-8 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="text-4xl mb-3">🔕</div>
            <div className="font-bold" style={{ color: 'var(--text2)' }}>No active alerts yet</div>
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Search for a product above to set your first alert</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeAlerts.map(alert => {
              const saving = alert.currentPrice - alert.targetPrice;
              const pct = Math.round((saving / alert.currentPrice) * 100);
              return (
                <div key={alert._id} className="rounded-2xl border p-4 flex items-center gap-4 hover:border-blue-500/30 transition"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--bg)' }}>
                    <img src={alert.productImage} alt={alert.productName} className="w-10 h-10 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm truncate" style={{ color: 'var(--text)' }}>{alert.productName}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: 'var(--text3)' }}>
                        Current: <strong style={{ color: 'var(--text)' }}>{fmt(alert.currentPrice)}</strong>
                      </span>
                      <span className="text-xs text-blue-400">→</span>
                      <span className="text-xs text-emerald-400 font-bold">Target: {fmt(alert.targetPrice)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)', maxWidth: '120px' }}>
                        <div className="h-full rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, (alert.targetPrice / alert.currentPrice) * 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-blue-400 font-bold">{pct}% drop needed</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full capitalize"
                      style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                      {alert.platform}
                    </span>
                    <button onClick={() => handleDelete(alert._id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs hover:bg-red-500/10 hover:text-red-400 transition"
                      style={{ color: 'var(--text3)', border: '1px solid var(--border)' }}>
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRIGGERED ALERTS */}
      {triggeredAlerts.length > 0 && (
        <div>
          <h3 className="font-black mb-3" style={{ color: 'var(--text)' }}>
            ✅ Triggered Alerts <span className="text-emerald-400 ml-1">({triggeredAlerts.length})</span>
          </h3>
          <div className="flex flex-col gap-3">
            {triggeredAlerts.map(alert => (
              <div key={alert._id} className="rounded-2xl border p-4 flex items-center gap-4 opacity-60"
                style={{ background: 'var(--surface)', borderColor: 'rgba(52,211,153,0.2)' }}>
                <div className="text-2xl">✅</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm truncate" style={{ color: 'var(--text)' }}>{alert.productName}</div>
                  <div className="text-xs text-emerald-400">Target {fmt(alert.targetPrice)} was reached!</div>
                </div>
                <Link href={`/product/${alert.slug}`}
                  className="text-xs font-bold px-3 py-2 rounded-xl text-white"
                  style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399' }}>
                  Buy Now →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}