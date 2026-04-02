'use client';
import { useState, useEffect } from 'react';

export default function WarrantyPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productName: '', brand: '', purchaseDate: '', warrantyMonths: '12', purchasePrice: '', platform: '', orderNumber: '' });
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('compario_token') : null;

  const fetchItems = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/warranty`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search?q=${search}`)
        .then(r => r.json()).then(d => setSearchResults(d.data || []));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleAdd = async () => {
    if (!form.productName || !form.purchaseDate || !form.warrantyMonths)
      return showMsg('error', 'Product name, purchase date and warranty period are required');
    setAdding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/warranty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', data.message);
        setShowForm(false);
        setForm({ productName: '', brand: '', purchaseDate: '', warrantyMonths: '12', purchasePrice: '', platform: '', orderNumber: '' });
        fetchItems();
      } else { showMsg('error', data.message); }
    } catch { showMsg('error', 'Failed. Try again.'); }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/warranty/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      setItems(prev => prev.filter(i => i._id !== id));
      showMsg('success', 'Item removed');
    } catch { showMsg('error', 'Failed'); }
  };

  const getDaysLeft = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    return Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
  };

  const getStatusStyle = (status) => {
    if (status === 'expired') return { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', badge: 'rgba(248,113,113,0.2)', badgeText: '#f87171', bar: '#ef4444', label: 'Expired' };
    if (status === 'expiring') return { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', badge: 'rgba(251,191,36,0.2)', badgeText: '#fbbf24', bar: '#f59e0b', label: 'Expiring Soon ⚠️' };
    return { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)', badge: 'rgba(52,211,153,0.2)', badgeText: '#34d399', bar: '#10b981', label: 'Active ✅' };
  };

  const getProgressPct = (purchaseDate, expiryDate) => {
    const total = new Date(expiryDate) - new Date(purchaseDate);
    const elapsed = new Date() - new Date(purchaseDate);
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const inputStyle = { width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '12px', padding: '11px 14px', fontSize: '14px', outline: 'none' };
  const labelStyle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', display: 'block', marginBottom: '6px' };

  const active = items.filter(i => i.status === 'active');
  const expiring = items.filter(i => i.status === 'expiring');
  const expired = items.filter(i => i.status === 'expired');

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>🛡️ Warranty Tracker</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Your digital filing cabinet for product warranties</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm text-white transition hover:scale-105"
          style={{ background: 'var(--accent)' }}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
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

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active', count: active.length, color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', icon: '✅' },
          { label: 'Expiring', count: expiring.length, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', icon: '⚠️' },
          { label: 'Expired', count: expired.length, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: '❌' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-4 text-center"
            style={{ background: s.bg, borderColor: s.border }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.count}</div>
            <div className="text-xs font-bold" style={{ color: 'var(--text3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ADD FORM */}
      {showForm && (
        <div className="rounded-3xl border p-6 mb-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="font-black mb-4" style={{ color: 'var(--text)' }}>Add Product Warranty</h3>

          {/* Product search from catalog */}
          <div className="relative mb-4">
            <label style={labelStyle}>Search from ComparIO catalog (optional)</label>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search phones, laptops..." style={inputStyle} />
            {searchResults.length > 0 && (
              <div className="absolute top-16 left-0 right-0 rounded-2xl shadow-2xl border z-50 overflow-hidden"
                style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
                {searchResults.slice(0, 4).map(p => (
                  <button key={p._id}
                    onClick={() => {
                      setForm({ ...form, productName: p.name, brand: p.brand, productImage: p.image });
                      setSearch(p.name);
                      setSearchResults([]);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition border-b last:border-0 text-left"
                    style={{ borderColor: 'var(--border)' }}>
                    <img src={p.image} alt={p.name} className="w-8 h-8 object-contain" />
                    <div className="font-bold text-xs" style={{ color: 'var(--text)' }}>{p.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })}
                placeholder="e.g. Samsung Galaxy S25" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Brand</label>
              <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Samsung" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Purchase Date *</label>
              <input type="date" value={form.purchaseDate}
                onChange={e => setForm({ ...form, purchaseDate: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Warranty Period *</label>
              <select value={form.warrantyMonths} onChange={e => setForm({ ...form, warrantyMonths: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="6">6 months</option>
                <option value="12">1 year</option>
                <option value="24">2 years</option>
                <option value="36">3 years</option>
                <option value="48">4 years</option>
                <option value="60">5 years</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Purchase Price (₹)</label>
              <input type="number" value={form.purchasePrice}
                onChange={e => setForm({ ...form, purchasePrice: e.target.value })}
                placeholder="e.g. 74999" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Where did you buy?</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select platform</option>
                <option value="amazon">Amazon</option>
                <option value="flipkart">Flipkart</option>
                <option value="croma">Croma</option>
                <option value="reliance">Reliance Digital</option>
                <option value="offline">Offline Store</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>Order Number (optional)</label>
              <input value={form.orderNumber} onChange={e => setForm({ ...form, orderNumber: e.target.value })}
                placeholder="e.g. 408-1234567-8901234" style={inputStyle} />
            </div>
          </div>

          <button onClick={handleAdd} disabled={adding}
            className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-60"
            style={{ background: 'var(--accent)' }}>
            {adding ? 'Adding...' : '🛡️ Track Warranty · Earn +10 Coins'}
          </button>
        </div>
      )}

      {/* WARRANTY LIST */}
      {loading ? (
        <div className="rounded-2xl border p-8 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-5xl mb-4">🛡️</div>
          <div className="font-black text-lg mb-2" style={{ color: 'var(--text)' }}>No warranties tracked yet</div>
          <p className="text-sm mb-4" style={{ color: 'var(--text3)' }}>
            Add products you've bought to track warranty and get expiry reminders
          </p>
          <button onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-xl font-black text-sm text-white"
            style={{ background: 'var(--accent)' }}>
            + Add Your First Product
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(item => {
            const daysLeft = getDaysLeft(item.expiryDate);
            const pct = getProgressPct(item.purchaseDate, item.expiryDate);
            const s = getStatusStyle(item.status);
            return (
              <div key={item._id} className="rounded-3xl border p-5 transition-all hover:scale-[1.005]"
                style={{ background: s.bg, borderColor: s.border }}>
                <div className="flex items-start gap-4">

                  {/* Image */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--surface)' }}>
                    {item.productImage
                      ? <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-contain" />
                      : <span className="text-2xl">📱</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="font-black" style={{ color: 'var(--text)' }}>{item.productName}</div>
                        {item.brand && <div className="text-xs" style={{ color: 'var(--text3)' }}>{item.brand}</div>}
                      </div>
                      <span className="text-xs font-black px-3 py-1 rounded-full flex-shrink-0"
                        style={{ background: s.badge, color: s.badgeText }}>
                        {s.label}
                      </span>
                    </div>

                    {/* Timeline bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text3)' }}>
                        <span>Purchased {new Date(item.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>Expires {new Date(item.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: s.bar }} />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-black" style={{ color: s.badgeText }}>
                        {daysLeft <= 0 ? 'Expired' : `${daysLeft} days left`}
                      </span>
                      {item.purchasePrice > 0 && (
                        <span style={{ color: 'var(--text3)' }}>
                          Paid: ₹{Number(item.purchasePrice).toLocaleString('en-IN')}
                        </span>
                      )}
                      {item.platform && (
                        <span className="capitalize px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--surface)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
                          {item.platform}
                        </span>
                      )}
                      {item.orderNumber && (
                        <span style={{ color: 'var(--text3)' }}>Order: {item.orderNumber}</span>
                      )}
                    </div>

                    {/* Action row */}
                    <div className="flex items-center gap-3 mt-3">
                      {item.status === 'expiring' && (
                        <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
                          style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                          ⚠️ Expiring in {daysLeft} days — consider renewal!
                        </div>
                      )}
                      {item.status === 'expired' && (
                        <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
                          style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                          ❌ Warranty expired — consider buying new?
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const model = encodeURIComponent(item.productName);
                          window.open(`https://www.google.com/search?q=${model}+service+center+India`, '_blank');
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border hover:scale-105 transition"
                        style={{ borderColor: 'var(--border)', color: 'var(--text3)', background: 'var(--surface)' }}>
                        🔧 Find Service Center
                      </button>
                      <button onClick={() => handleDelete(item._id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition"
                        style={{ borderColor: 'var(--border)', color: 'var(--text3)', background: 'var(--surface)' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}