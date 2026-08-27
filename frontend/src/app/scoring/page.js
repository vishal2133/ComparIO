'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const dimensions = ['performance', 'camera', 'battery', 'display', 'design'];

const priceOf = product => Math.min(...(product.prices || []).map(item => item.price).filter(Number.isFinite));

function ScoreBars({ scores }) {
  if (!scores) return <span style={{ color: 'var(--text3)', fontSize: '12px' }}>Not scored yet</span>;
  return <div style={{ display: 'grid', gap: '6px', minWidth: '230px' }}>{dimensions.map(key => <div key={key} style={{ display: 'grid', gridTemplateColumns: '78px 1fr 26px', gap: '7px', alignItems: 'center', fontSize: '11px' }}><span style={{ color: 'var(--text3)', textTransform: 'capitalize' }}>{key}</span><span style={{ height: '6px', borderRadius: '99px', overflow: 'hidden', background: 'var(--border)' }}><span style={{ width: `${Math.min(10, scores[key] || 0) * 10}%`, height: '100%', display: 'block', background: 'var(--accent)' }} /></span><strong>{scores[key] ?? '—'}</strong></div>)}</div>;
}

export default function ScoringPage() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');

  const loadProducts = useCallback(async () => {
    try { const response = await fetch(`${API_URL}/api/scoring/products`); const data = await response.json(); if (!data.success) throw new Error(data.message); setProducts(data.data); }
    catch (error) { setMessage(error.message || 'Could not load stored products.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  const scoredCount = useMemo(() => products.filter(product => product.categoryScores).length, [products]);
  const score = async (slugs = []) => {
    setWorking(true); setMessage('');
    try { const response = await fetch(`${API_URL}/api/scoring/score`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slugs }) }); const data = await response.json(); if (!data.success) throw new Error(data.message); setMessage(`Saved scores for ${data.data.scored} phone(s).`); setSelected(new Set()); await loadProducts(); }
    catch (error) { setMessage(error.message || 'Could not calculate scores.'); }
    finally { setWorking(false); }
  };
  const toggle = slug => setSelected(current => { const next = new Set(current); next.has(slug) ? next.delete(slug) : next.add(slug); return next; });
  const toggleAll = () => setSelected(selected.size === products.length ? new Set() : new Set(products.map(product => product.slug)));

  return <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}><div style={{ maxWidth: '1050px', margin: '0 auto', padding: '40px 24px' }}>
    <p style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Scoring workspace</p>
    <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '0 0 8px' }}>Product scoring system</h1>
    <p style={{ color: 'var(--text3)', marginTop: 0 }}>Calculate and store the five recommendation dimensions for every phone in your database.</p>
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', margin: '24px 0' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}><span style={{ color: 'var(--text3)', fontSize: '12px' }}>Stored phones</span><strong style={{ display: 'block', fontSize: '27px', marginTop: '4px' }}>{products.length}</strong></div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}><span style={{ color: 'var(--text3)', fontSize: '12px' }}>Already scored</span><strong style={{ display: 'block', fontSize: '27px', marginTop: '4px', color: '#4ade80' }}>{scoredCount}</strong></div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}><span style={{ color: 'var(--text3)', fontSize: '12px' }}>Pending scoring</span><strong style={{ display: 'block', fontSize: '27px', marginTop: '4px', color: '#fbbf24' }}>{products.length - scoredCount}</strong></div>
    </section>
    <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}><div><h2 style={{ margin: 0, fontSize: '18px' }}>Stored phone history</h2><p style={{ color: 'var(--text3)', fontSize: '12px', marginBottom: 0 }}>Performance, camera, battery, display, and design are stored as scores out of 10.</p></div><div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><label style={{ fontSize: '12px', color: 'var(--text2)' }}><input type="checkbox" checked={products.length > 0 && selected.size === products.length} onChange={toggleAll} /> Select all</label><button disabled={working} onClick={() => score(selected.size ? [...selected] : [])} style={{ padding: '10px 14px', border: 0, borderRadius: '9px', background: 'var(--accent)', color: '#fff', fontWeight: 800, cursor: working ? 'not-allowed' : 'pointer' }}>{working ? 'Scoring…' : selected.size ? `Score selected (${selected.size})` : 'Score all phones'}</button></div></div>
      {message && <p style={{ color: message.startsWith('Saved') ? '#4ade80' : '#f87171', fontSize: '13px' }}>{message}</p>}
      <div style={{ display: 'grid', gap: '10px', marginTop: '18px' }}>{loading ? <p style={{ color: 'var(--text3)' }}>Loading stored products…</p> : products.map(product => <article key={product._id} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(180px, 1fr) minmax(230px, 340px) auto', gap: '14px', alignItems: 'center', padding: '15px', border: '1px solid var(--border)', borderRadius: '12px' }}><input type="checkbox" checked={selected.has(product.slug)} onChange={() => toggle(product.slug)} /><div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>{product.image && <img src={product.image} alt="" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />}<div><strong>{product.name}</strong><div style={{ color: 'var(--text3)', fontSize: '11px', marginTop: '4px' }}>{product.brand} · {Number.isFinite(priceOf(product)) ? `₹${priceOf(product).toLocaleString('en-IN')}` : 'Price unavailable'}</div></div></div><ScoreBars scores={product.categoryScores} /><div style={{ display: 'grid', gap: '7px', justifyItems: 'end' }}><button onClick={() => score([product.slug])} disabled={working} style={{ padding: '7px 10px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '7px', fontWeight: 800, fontSize: '11px', cursor: working ? 'not-allowed' : 'pointer' }}>{product.categoryScores ? 'Re-score' : 'Score'}</button><Link href={`/product/${product.slug}`} style={{ color: 'var(--text3)', fontSize: '11px' }}>View product</Link></div></article>)}</div>
      {!loading && !products.length && <p style={{ padding: '24px', color: 'var(--text3)', textAlign: 'center' }}>No phone products are stored yet. Add phones from the Scraper Workspace first.</p>}
    </section>
  </div></main>;
}
