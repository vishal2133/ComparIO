'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PersonalizedSummary from '@/components/PersonalizedSummary';
import Smarty from '@/components/Smarty';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import PriceAlertForm from '@/components/PriceAlertForm';
import ReviewShield from '@/components/ReviewShield';
import { use3DCard } from '@/hooks/useAnimations';

// ─── Spec section definitions ─────────────────────────────────────────────────
// Phone sections → read from product.parsedSpecs
const PHONE_SPEC_SECTIONS = [
  ['General', 'general'], ['Design', 'design'], ['Display', 'display'],
  ['Performance', 'performance'], ['Memory', 'memory'], ['Camera', 'camera'],
  ['Battery', 'battery'], ['Connectivity', 'connectivity'],
  ['Extra features', 'extra'], ['Technical', 'technical'], ['Multimedia', 'multimedia'],
];

// Laptop sections → ordered to match Amazon full-specs layout exactly
// Read from product.parsedSpecs (all sub-paths are now Mixed → fully returned)
const LAPTOP_SPEC_SECTIONS = [
  { key: 'general',      title: 'General',       icon: '📋' },
  { key: 'display',      title: 'Display',        icon: '🖥️' },
  { key: 'connectivity', title: 'Connectivity',   icon: '🔌' },
  { key: 'input',        title: 'Input',          icon: '⌨️' },
  { key: 'processor',    title: 'Processor',      icon: '⚡' },
  { key: 'gpu',          title: 'Graphics',       icon: '🎮' },
  { key: 'memory',       title: 'Memory',         icon: '💾' },
  { key: 'battery',      title: 'Battery',        icon: '🔋' },
  { key: 'audio',        title: 'Audio',          icon: '🔊' },
  { key: 'security',     title: 'Security',       icon: '🔒' },
  { key: 'extra',        title: 'Extra',          icon: '📦' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatSpecValue = (value) => {
  if (value === null || value === undefined || value === '' || value === false) return null;
  if (value === true) return 'Yes';
  if (Array.isArray(value)) return value.map(formatSpecValue).filter(Boolean).join(', ');
  if (typeof value === 'object') return null;
  return String(value);
};

const formatSpecLabel = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, l => l.toUpperCase());

const formatPrice = (p) => `₹${p.toLocaleString('en-IN')}`;

// Keep each price tied to its actual retailer/source.
const normPlatform = (p) =>
  !p ? 'Unknown retailer' : p.charAt(0).toUpperCase() + p.slice(1);

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProductImage3D({ image, name }) {
  const imageRef = useRef(null);
  use3DCard(imageRef);
  return (
    <div className="card-3d-wrap" style={{ perspective: '1000px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div ref={imageRef} className="card-3d" style={{ transition: 'transform 0.1s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {image
          ? <img src={image} alt={name} style={{ width: '100%', maxHeight: '260px', objectFit: 'contain' }} />
          : <span style={{ color: 'var(--text3)' }}>Product image coming soon</span>}
      </div>
    </div>
  );
}

function SpecValue({ value }) {
  const [expanded, setExpanded] = useState(false);
  const text = String(value);
  const isBoolean = text === 'Yes' || text === 'No';
  const isLong = text.length > 110;
  const visible = isLong && !expanded ? `${text.slice(0, 110)}…` : text;

  if (isBoolean) {
    return (
      <span style={{
        color: text === 'Yes' ? '#4ade80' : '#f87171',
        background: text === 'Yes' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
        borderRadius: '999px', padding: '3px 9px', fontWeight: 800, fontSize: '11px',
      }}>{text}</span>
    );
  }
  return (
    <span style={{ color: 'var(--text)', fontWeight: 700, textAlign: 'right' }}>
      {visible}
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} style={{ display: 'block', margin: '5px 0 0 auto', padding: 0, background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer', fontSize: '11px', fontWeight: 800 }}>
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </span>
  );
}

// ─── Phone spec accordion (existing behaviour) ────────────────────────────────
function PhoneSpecCards({ sections }) {
  const [open, setOpen] = useState(false);
  if (!sections.length) return null;
  return (
    <section style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', margin: 0 }}>Full specifications</h2>
          <p style={{ margin: '5px 0 0', color: 'var(--text3)', fontSize: '12px' }}>{sections.length} detailed categories</p>
        </div>
        <button onClick={() => setOpen(!open)} style={{ border: '1px solid var(--accent)', borderRadius: '10px', padding: '10px 14px', background: open ? 'var(--accent)' : 'transparent', color: open ? '#fff' : 'var(--accent)', fontWeight: 800, cursor: 'pointer' }}>
          {open ? 'Hide full specs' : 'View full specs →'}
        </button>
      </div>
      {open && (
        <div style={{ display: 'grid', gap: '10px' }}>
          {sections.map(({ title, entries }, i) => (
            <details key={title} open={i === 0} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
              <summary style={{ cursor: 'pointer', padding: '15px 18px', fontSize: '13px', fontWeight: 900, color: 'var(--text)', listStyle: 'none' }}>
                {title}<span style={{ float: 'right', color: 'var(--accent)' }}>⌄</span>
              </summary>
              <div style={{ padding: '0 18px 10px' }}>
                {entries.map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', padding: '10px 0', borderTop: '1px solid var(--border)', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text3)', flex: '0 0 42%' }}>{label}</span>
                    <SpecValue value={value} />
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Laptop spec panel — organised exactly like Amazon's full-specs page ──
const LAPTOP_SECTION_ALIASES = {
  general: 'general', display: 'display', connectivity: 'connectivity', input: 'input',
  processor: 'processor', performance: 'processor', graphics: 'gpu', gpu: 'gpu',
  memory: 'memory', storage: 'memory', battery: 'battery', audio: 'audio',
  security: 'security', extra: 'extra', extras: 'extra', software: 'extra',
};

const sectionKey = (key) => LAPTOP_SECTION_ALIASES[String(key || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()];

function LaptopSpecPanel({ parsedSpecs, rawSpecs }) {
  const [openSections, setOpenSections] = useState({ general: true, display: true, processor: true });

  const toggle = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  // Keep every factual Amazon row: parsedSpecs contains our named fields,
  // while rawSpecs preserves new/unmapped rows from the full-specs page.
  const combinedSpecs = Object.fromEntries(
    LAPTOP_SPEC_SECTIONS.map(({ key }) => [key, { ...(parsedSpecs?.[key] || {}) }]),
  );
  const extraSections = [];
  Object.entries(rawSpecs || {}).forEach(([rawTitle, rawEntries]) => {
    if (!rawEntries || typeof rawEntries !== 'object' || Array.isArray(rawEntries)) return;
    const key = sectionKey(rawTitle);
    if (key) Object.assign(combinedSpecs[key], rawEntries);
    else extraSections.push({ key: `source-${rawTitle}`, title: formatSpecLabel(rawTitle), icon: '📋', section: rawEntries });
  });

  const availableSections = LAPTOP_SPEC_SECTIONS
    .map(({ key, title, icon }) => {
      const section = combinedSpecs[key];
      if (!section || typeof section !== 'object' || Array.isArray(section)) return null;
      const entries = Object.entries(section)
        .map(([k, v]) => [formatSpecLabel(k), formatSpecValue(v)])
        .filter(([, v]) => v);
      return entries.length ? { key, title, icon, entries } : null;
    })
    .filter(Boolean)
    .concat(extraSections.map(({ key, title, icon, section }) => {
      const entries = Object.entries(section)
        .map(([k, v]) => [formatSpecLabel(k), formatSpecValue(v)])
        .filter(([, v]) => v);
      return entries.length ? { key, title, icon, entries } : null;
    }).filter(Boolean));

  if (!availableSections.length) return null;

  return (
    <section style={{ marginTop: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px', color: 'var(--text)' }}>Full specifications</h2>
      <div style={{ display: 'grid', gap: '10px' }}>
        {availableSections.map(({ key, title, icon, entries }) => {
          const isOpen = openSections[key] !== false;
          return (
            <div key={key} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
              {/* Section header */}
              <button
                onClick={() => toggle(key)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 900, color: 'var(--text)' }}>
                  <span style={{ fontSize: '16px' }}>{icon}</span>
                  {title}
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', marginLeft: '4px' }}>({entries.length})</span>
                </span>
                <span style={{ color: 'var(--accent)', fontSize: '16px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
              </button>

              {/* Spec rows */}
              {isOpen && (
                <div style={{ padding: '0 18px 12px', borderTop: '1px solid var(--border)' }}>
                  {entries.map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text3)', flex: '0 0 40%', lineHeight: '1.4' }}>{label}</span>
                      <SpecValue value={value} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`)
      .then(r => r.json())
      .then(d => { if (!d.success) setNotFound(true); else setProduct(d.data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <main style={{ minHeight: '100vh', background: 'var(--bg)' }} />;
  if (notFound || !product) return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}><h2>Product not found</h2><Link href="/" style={{ color: 'var(--accent)' }}>Back to homepage</Link></div>
    </main>
  );

  const isLaptop = product.category === 'laptop';

  // Price normalisation
  // Smartprix is the data source; only retailer offers are shown to shoppers.
  const prices = (product.prices || []).filter(p =>
    ['amazon', 'flipkart'].includes(String(p.platform).toLowerCase())
    && Number.isFinite(p.price)
    && p.price > 0,
  );
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const bestPrice = sortedPrices[0]?.price;
  const bestPlatformLabel = normPlatform(sortedPrices[0]?.platform);
  const savings = prices.length > 1 ? Math.max(...prices.map(p => p.price)) - bestPrice : 0;

  // Spec data source
  const ps = product.parsedSpecs || {};
  const rawLaptopFacts = isLaptop
    ? Object.assign({}, ...Object.values(product.rawSpecs || {}).filter(section => section && typeof section === 'object' && !Array.isArray(section)))
    : {};
  const laptopFact = (...keys) => keys.map(key => rawLaptopFacts[key]).find(value => value !== undefined && value !== '');
  const laptopProcessor = ps.processor?.name || ps.processor?.processor || product.processor?.name || product.processor?.processor || laptopFact('processor', 'cpu', 'processor name');
  const laptopGeneration = ps.processor?.generation || product.processor?.generation || laptopFact('generation', 'processor generation', 'cpu generation', 'gen');
  const processorWithGeneration = laptopProcessor && laptopGeneration
    && !String(laptopProcessor).toLowerCase().includes(String(laptopGeneration).toLowerCase())
    ? `${laptopProcessor} · ${laptopGeneration}`
    : laptopProcessor;

  // ── Key specs (hero highlight tiles) ──────────────────────────────────────
  const keySpecs = (isLaptop ? [
    ['Processor',  processorWithGeneration],
    ['Graphics',   ps.gpu?.name || ps.gpu?.gpu || product.gpu?.name || product.gpu?.gpu || laptopFact('graphics processor', 'gpu', 'graphics')],
    ['Cores',      ps.processor?.cores || product.processor?.cores || laptopFact('cores', 'processor cores', 'number of cores')],
    ['Display',    ps.display?.size ? `${ps.display.size} inches${ps.display.resolution ? ` · ${ps.display.resolution}` : ''}` : (ps.display?.resolution || product.display?.resolution || laptopFact('display size', 'screen size', 'resolution'))],
    ['RAM',        ps.memory?.ram ? `${ps.memory.ram}${typeof ps.memory.ram === 'number' ? ' GB' : ''}${ps.memory.ramType ? ` ${ps.memory.ramType}` : ''}` : (product.memory?.ram || laptopFact('ram', 'memory'))],
    ['OS',         ps.general?.os || ps.technical?.os || product.os || laptopFact('operating system', 'os')],
    ['Storage',    ps.memory?.ssd || ps.memory?.solidStateDrive || product.memory?.ssd || laptopFact('solid state drive', 'ssd', 'storage')],
    ['Warranty',   ps.general?.warranty || product.general?.warranty || laptopFact('warranty', 'warranty period')],
  ] : [
    ['Display',      ps.display?.size ? `${ps.display.size}${ps.display.refreshRate ? ` · ${ps.display.refreshRate}` : ''}` : product.display?.size && `${product.display.size}-inch`],
    ['Camera',       ps.camera?.rearCamera || (product.camera?.rear?.[0]?.mp && `${product.camera.rear[0].mp} MP`)],
    ['Battery',      ps.battery?.capacity ? `${ps.battery.capacity}${ps.battery.fastCharging ? ` · ${ps.battery.fastCharging}` : ''}` : product.battery?.capacity && `${product.battery.capacity} mAh`],
    ['Chipset',      ps.performance?.chipset || product.performance?.chipset],
    ['Memory',       ps.memory?.ram ? `${ps.memory.ram}${ps.memory.storage ? ` · ${ps.memory.storage}` : ''}` : product.memory?.ram && `${product.memory.ram} GB`],
    ['Connectivity', [ps.connectivity?.fiveG, ps.connectivity?.nfc, ps.extra?.ipRating].filter(Boolean).join(' · ')],
  ]).map(([label, value]) => ({ label, value: formatSpecValue(value) })).filter(item => item.value);

  // ── Phone spec accordion sections ─────────────────────────────────────────
  const phoneSpecSections = !isLaptop
    ? PHONE_SPEC_SECTIONS.map(([title, key]) => {
        const section = ps[key];
        if (!section || typeof section !== 'object' || Array.isArray(section)) return null;
        const entries = Object.entries(section).map(([k, v]) => [formatSpecLabel(k), formatSpecValue(v)]).filter(([, v]) => v);
        return entries.length ? { title, entries } : null;
      }).filter(Boolean)
    : [];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text3)', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--text3)' }}>Home</Link>
          <span>→</span>
          <Link href={isLaptop ? '/laptops' : '/phones'} style={{ color: 'var(--text3)' }}>
            {isLaptop ? 'Laptops' : 'Phones'}
          </Link>
          <span>→</span>
          <span>{product.name}</span>
        </div>

        {/* Hero: image + key info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', minHeight: '280px', position: 'relative' }}>
            {savings > 0 && (
              <span style={{ position: 'absolute', top: '16px', left: '16px', background: '#16a34a', color: '#fff', fontSize: '11px', fontWeight: 900, padding: '4px 10px', borderRadius: '8px' }}>
                SAVE {formatPrice(savings)}
              </span>
            )}
            <button onClick={handleShare} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
              {copied ? 'Copied!' : 'Share'}
            </button>
            <ProductImage3D image={product.image} name={product.name} />
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{product.brand}</div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, margin: '4px 0 16px' }}>{product.name}</h1>

            {bestPrice && (
              <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '16px', padding: '16px 20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase' }}>Best price</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#4ade80' }}>{formatPrice(bestPrice)}</div>
                <div style={{ fontSize: '11px', color: '#86efac' }}>on {bestPlatformLabel}</div>
              </div>
            )}

            {keySpecs.length > 0 && (
              isLaptop ? (
                <div style={{ padding: '4px 0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '24px', rowGap: '10px' }}>
                    {keySpecs.map((spec, i) => (
                      <div key={`${spec.label}-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, fontSize: '12px', color: 'var(--text2)', lineHeight: 1.45 }}>
                        <span aria-hidden="true" style={{ color: 'var(--accent)', fontWeight: 900 }}>✓</span>
                        <span>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '12px' }}>Key specs</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {keySpecs.map((spec, i) => (
                      <div key={`${spec.label}-${i}`} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{spec.label}</div>
                        <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Price comparison */}
        {sortedPrices.length > 0 && (
          <section style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>Price comparison</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedPrices.map((price, i) => {
                const retailerName = normPlatform(price.platform);
                const retailer = `${retailerName} price`;
                const canBuy = Boolean(price.affiliateUrl && price.inStock !== false);
                return (
                  <div key={price._id || `${price.platform}-${price.price}`} style={{ borderRadius: '16px', border: i === 0 ? '2px solid rgba(22,163,74,0.5)' : '1px solid var(--border)', padding: '20px 24px', background: i === 0 ? 'rgba(22,163,74,0.06)' : 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <strong>{retailer}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                        {i === 0 ? 'Best listed price' : `${formatPrice(price.price - bestPrice)} more expensive`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <strong style={{ fontSize: '22px' }}>{formatPrice(price.price)}</strong>
                      {canBuy && (
                        <a href={price.affiliateUrl} target="_blank" rel="noopener noreferrer"
                          style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 900, fontSize: '13px', textDecoration: 'none', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff' }}>
                          View deal
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Spec sections — laptop gets organised panel, phone gets accordion */}
        {isLaptop
          ? <LaptopSpecPanel parsedSpecs={ps} rawSpecs={product.rawSpecs} />
          : <PhoneSpecCards sections={phoneSpecSections} />}

        {/* Price history chart */}
        {prices.length > 0 && (
          <section style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>Price history</h2>
            <PriceHistoryChart slug={product.slug} currentPrices={prices} />
          </section>
        )}

        {/* Price alert */}
        {bestPrice && (
          <section style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>🔔 Set a price alert</h2>
            <PriceAlertForm slug={product.slug} currentBestPrice={bestPrice} />
          </section>
        )}

        {/* AI summary */}
        <section style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>AI Product Summary</h2>
          <PersonalizedSummary slug={product.slug} />
        </section>

        {/* Review authenticity (ReviewShield) — only for phones with platform prices */}
        {prices.length > 0 && (
          <section style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>🛡️ Review Authenticity Check</h2>
            <ReviewShield slug={product.slug} prices={prices} />
          </section>
        )}

        {bestPrice && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text3)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '8px 16px', borderRadius: '8px' }}>
              Prices last verified on {new Date(product.priceUpdatedAt || sortedPrices[0]?.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
            </span>
          </div>
        )}

        <div style={{ marginTop: '24px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '12px', padding: '12px 20px', fontSize: '12px', color: 'var(--text3)', textAlign: 'center' }}>
          ComparIO earns a small affiliate commission when you buy through our links — at no extra cost to you.
        </div>
      </div>
      <Smarty context={{ productName: product.name, brand: product.brand, page: 'product' }} />
    </main>
  );
}
