'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const PHONE_BRANDS = ['Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Google', 'Vivo', 'Oppo', 'Realme', 'Motorola', 'Nothing'];
const LAPTOP_BRANDS = ['Asus', 'Dell', 'HP', 'Lenovo', 'Apple', 'MSI', 'Acer', 'Samsung', 'LG', 'Microsoft'];
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const productName = (slug) => String(slug || '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

export default function ScraperPage() {
  const [tab, setTab] = useState('phone'); // 'phone' | 'laptop'

  // Phone scrape state
  const [phoneBrand, setPhoneBrand] = useState(PHONE_BRANDS[0]);
  const [phoneLimit, setPhoneLimit] = useState('5');

  // Laptop scrape state
  const [laptopBrand, setLaptopBrand] = useState(LAPTOP_BRANDS[0]);
  const [laptopLimit, setLaptopLimit] = useState('5');

  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageOk, setMessageOk] = useState(true);

  // Multi-select state
  const [selectedSlugs, setSelectedSlugs] = useState(new Set());

  const loadData = useCallback(async () => {
    const [statusResult, historyResult] = await Promise.allSettled([
      fetch(`${API_URL}/api/scraper/status`).then((r) => r.json()),
      fetch(`${API_URL}/api/scraper/history?category=${tab}`).then((r) => r.json()),
    ]);

    if (statusResult.status === 'fulfilled' && statusResult.value.success) setStatus(statusResult.value.data);
    if (historyResult.status === 'fulfilled' && historyResult.value.success) setHistory(historyResult.value.data);
    if (statusResult.status === 'fulfilled' && !statusResult.value.success) {
      setMessage(statusResult.value.message);
      setMessageOk(false);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    setHistory([]);
    setSelectedSlugs(new Set()); // Reset selections on tab change
    setLoading(true);
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, [loadData]);

  const startScrape = async (event) => {
    event.preventDefault();
    setStarting(true);
    setMessage('');
    try {
      const isPhone = tab === 'phone';
      const brand = isPhone ? phoneBrand.toLowerCase() : laptopBrand.toLowerCase();
      const limit = Number(isPhone ? phoneLimit : laptopLimit);
      const endpoint = isPhone ? '/api/scraper/phones' : '/api/scraper/laptops';

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, limit }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      setMessage(`Scraping ${isPhone ? phoneBrand : laptopBrand} ${isPhone ? 'phones' : 'laptops'} has started. This page refreshes automatically.`);
      setMessageOk(true);
      loadData();
    } catch (error) {
      setMessage(error.message || 'Could not start the scraper.');
      setMessageOk(false);
    } finally {
      setStarting(false);
    }
  };

  const handleUpdate = async (slugsToUpdate) => {
    if (!slugsToUpdate || slugsToUpdate.length === 0) return;
    setStarting(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/scraper/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: tab, slugs: slugsToUpdate }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      setMessage(`Started re-scraping ${slugsToUpdate.length} product(s).`);
      setMessageOk(true);
      setSelectedSlugs(new Set());
      loadData();
    } catch (error) {
      setMessage(error.message || 'Could not start the update.');
      setMessageOk(false);
    } finally {
      setStarting(false);
    }
  };

  const handleScore = async (slugsToScore = []) => {
    setStarting(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/scraper/score`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: slugsToScore }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      setMessage(`Saved recommendation scores for ${result.data.scored} phone(s).`);
      setMessageOk(true);
      loadData();
    } catch (error) {
      setMessage(error.message || 'Could not score products.');
      setMessageOk(false);
    } finally {
      setStarting(false);
    }
  };

  const toggleSelect = (slug) => {
    const next = new Set(selectedSlugs);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelectedSlugs(next);
  };

  const toggleSelectAll = () => {
    if (selectedSlugs.size === history.length) {
      setSelectedSlugs(new Set());
    } else {
      setSelectedSlugs(new Set(history.map(p => p.slug)));
    }
  };

  const running = status?.status?.running || status?.active;
  const progress = status?.progress;
  const currentProduct = status?.status?.lastProduct;
  const recentlySaved = [...(progress?.scraped || [])].slice(-4).reverse();

  const tabBtnStyle = (active) => ({
    padding: '10px 22px',
    borderRadius: '10px',
    fontWeight: 800,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: active ? 'var(--accent)' : 'var(--surface)',
    color: active ? '#fff' : 'var(--text2)',
    border: active ? 'none' : '1px solid var(--border)',
  });

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Scraper workspace
          </p>
          <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '6px 0' }}>Add specifications</h1>
          <p style={{ color: 'var(--text3)', margin: 0 }}>
            Choose a category and brand, start a small scrape, and review every saved product below.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button style={tabBtnStyle(tab === 'phone')} onClick={() => setTab('phone')}>📱 Phones</button>
          <button style={tabBtnStyle(tab === 'laptop')} onClick={() => setTab('laptop')}>💻 Laptops</button>
        </div>

        {/* Scrape form */}
        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px' }}>
          <form onSubmit={startScrape} style={{ display: 'flex', alignItems: 'end', gap: '14px', flexWrap: 'wrap' }}>

            {tab === 'phone' ? (
              <label style={{ display: 'grid', gap: '7px', fontSize: '12px', fontWeight: 700, color: 'var(--text2)' }}>
                Phone brand
                <select value={phoneBrand} onChange={(e) => setPhoneBrand(e.target.value)}
                  style={{ minWidth: '190px', padding: '11px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                  {PHONE_BRANDS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
            ) : (
              <label style={{ display: 'grid', gap: '7px', fontSize: '12px', fontWeight: 700, color: 'var(--text2)' }}>
                Laptop brand
                <select value={laptopBrand} onChange={(e) => setLaptopBrand(e.target.value)}
                  style={{ minWidth: '190px', padding: '11px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                  {LAPTOP_BRANDS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
            )}

            <label style={{ display: 'grid', gap: '7px', fontSize: '12px', fontWeight: 700, color: 'var(--text2)' }}>
              Products to scrape
              <select
                value={tab === 'phone' ? phoneLimit : laptopLimit}
                onChange={(e) => tab === 'phone' ? setPhoneLimit(e.target.value) : setLaptopLimit(e.target.value)}
                style={{ padding: '11px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                {[3, 5, 10, 25].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>

            <button type="submit" disabled={starting || running}
              style={{ padding: '12px 18px', border: 0, borderRadius: '10px', background: 'var(--accent)', color: '#fff', fontWeight: 800, cursor: starting || running ? 'not-allowed' : 'pointer', opacity: starting || running ? 0.6 : 1 }}>
              {starting ? 'Starting…' : running ? 'Scraper running' : 'Start scrape'}
            </button>
          </form>

          {message && (
            <p style={{ margin: '16px 0 0', color: messageOk ? '#4ade80' : '#f87171', fontSize: '13px' }}>
              {message}
            </p>
          )}
        </section>

        {/* Live progress */}
        <section style={{ marginTop: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px' }}>
          <h2 style={{ fontSize: '16px', margin: 0 }}>Live progress</h2>
          {loading ? (
            <p style={{ color: 'var(--text3)' }}>Loading scraper status…</p>
          ) : (
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', marginTop: '12px', fontSize: '13px' }}>
              <span><strong style={{ color: running ? '#fbbf24' : '#4ade80' }}>{running ? 'Running' : 'Idle'}</strong></span>
              <span style={{ color: 'var(--text2)' }}>Current: {currentProduct ? productName(currentProduct) : '—'}</span>
              <span style={{ color: 'var(--text2)' }}>Saved: {progress?.totalScraped || 0}</span>
              <span style={{ color: 'var(--text2)' }}>Failed: {progress?.failed?.length || 0}</span>
            </div>
          )}
          {running && currentProduct && (
            <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#93c5fd', fontWeight: 700, fontSize: '13px' }}>
              Scraping now: {productName(currentProduct)}. It will appear in history as soon as it is saved.
            </div>
          )}
          {!running && recentlySaved.length > 0 && (
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text2)' }}>
              Recently saved: {recentlySaved.map(productName).join(', ')}
            </div>
          )}
        </section>

        {/* History */}
        <section style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '6px' }}>Scrape history</h2>
              <p style={{ color: 'var(--text3)', fontSize: '13px', margin: 0 }}>
                Select products to force a re-scrape and update their specifications.
              </p>
            </div>
            {history.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: 'var(--text2)' }}>
                  <input type="checkbox"
                    checked={history.length > 0 && selectedSlugs.size === history.length}
                    onChange={toggleSelectAll}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  Select All
                </label>
                <button
                  disabled={selectedSlugs.size === 0 || starting || running}
                  onClick={() => handleUpdate([...selectedSlugs])}
                  style={{
                    padding: '8px 14px', border: 0, borderRadius: '8px',
                    background: selectedSlugs.size > 0 ? 'var(--accent)' : 'var(--border)',
                    color: selectedSlugs.size > 0 ? '#fff' : 'var(--text3)',
                    fontWeight: 800, fontSize: '12px',
                    cursor: selectedSlugs.size > 0 && !starting && !running ? 'pointer' : 'not-allowed',
                  }}>
                  Update Selected ({selectedSlugs.size})
                </button>
                {tab === 'phone' && (
                  <button
                    disabled={starting}
                    onClick={() => handleScore(selectedSlugs.size ? [...selectedSlugs] : [])}
                    style={{ padding: '8px 14px', border: '1px solid var(--accent)', borderRadius: '8px', background: 'transparent', color: 'var(--accent)', fontWeight: 800, fontSize: '12px', cursor: starting ? 'not-allowed' : 'pointer' }}>
                    {selectedSlugs.size ? `Score Selected (${selectedSlugs.size})` : 'Score All Phones'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {history.map((product) => (
              <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <input
                  type="checkbox"
                  checked={selectedSlugs.has(product.slug)}
                  onChange={() => toggleSelect(product.slug)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 800, flex: 1 }}>{product.name}</span>
                {tab === 'phone' && (
                  <span style={{ color: product.categoryScores ? '#4ade80' : 'var(--text3)', fontSize: '11px', fontWeight: 700 }}>
                    {product.categoryScores ? 'Scored' : 'Not scored'}
                  </span>
                )}
                <button
                  disabled={starting || running}
                  onClick={() => handleUpdate([product.slug])}
                  style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', fontSize: '12px', fontWeight: 700, cursor: starting || running ? 'not-allowed' : 'pointer' }}>
                  Update
                </button>
                <Link href={`/product/${product.slug}`} style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                  View specs →
                </Link>
              </div>
            ))}
            {!loading && history.length === 0 && (
              <div style={{ padding: '24px', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text3)', textAlign: 'center' }}>
                No scraped {tab === 'phone' ? 'phones' : 'laptops'} yet.
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
