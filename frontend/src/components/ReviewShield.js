'use client';
import { useState } from 'react';

export default function ReviewShield({ slug, prices }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState(prices?.[0]?.platform || 'amazon');
  const [activeTab, setActiveTab] = useState('overview');

  const analyse = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, platform }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Analysis failed. Try again.');
      }
    } catch {
      setError('Connection failed. Make sure backend is running.');
    }
    setLoading(false);
  };

  const getTrustColor = (score) => {
    if (score >= 75) return { text: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' };
    if (score >= 50) return { text: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' };
    return { text: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' };
  };

  const getSeverityColor = (sev) => {
    if (sev === 'high') return { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.25)', icon: '🚨' };
    if (sev === 'medium') return { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24', border: 'rgba(251,191,36,0.25)', icon: '⚠️' };
    return { bg: 'rgba(156,163,175,0.1)', text: 'var(--text3)', border: 'rgba(156,163,175,0.25)', icon: 'ℹ️' };
  };

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
            🛡️
          </div>
          <div>
            <div className="font-black text-sm" style={{ color: 'var(--text)' }}>Review Shield</div>
            <div className="text-xs" style={{ color: 'var(--text3)' }}>
              AI-powered fake review detector
            </div>
          </div>
        </div>
        {data && (
          <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
            style={{
              background: getTrustColor(data.trustScore).bg,
              borderColor: getTrustColor(data.trustScore).border,
              color: getTrustColor(data.trustScore).text,
            }}>
            {data.trustScore}/100 Trust Score
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-5">

        {/* Platform selector + trigger */}
        {!data && !loading && (
          <div>
            <p className="text-sm mb-4" style={{ color: 'var(--text2)' }}>
              Our AI analyses up to <strong style={{ color: 'var(--text)' }}>100 recent reviews</strong> to detect
              fake ratings, bot patterns, and suspicious activity — so you buy with confidence.
            </p>

            <div className="flex gap-2 mb-4">
              {prices?.map(p => (
                <button key={p.platform}
                  onClick={() => setPlatform(p.platform)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    platform === p.platform ? 'scale-105' : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{
                    background: platform === p.platform
                      ? p.platform === 'amazon' ? 'rgba(251,191,36,0.15)' : 'rgba(59,130,246,0.15)'
                      : 'var(--bg)',
                    borderColor: platform === p.platform
                      ? p.platform === 'amazon' ? 'rgba(251,191,36,0.4)' : 'rgba(59,130,246,0.4)'
                      : 'var(--border)',
                    color: platform === p.platform
                      ? p.platform === 'amazon' ? '#fbbf24' : '#60a5fa'
                      : 'var(--text3)',
                  }}>
                  {p.platform === 'amazon' ? '🛒' : '🛍️'}
                  {p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
                ❌ {error}
              </div>
            )}

            <button onClick={analyse}
              className="w-full py-4 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', boxShadow: '0 4px 16px rgba(217,119,6,0.25)' }}>
              <span>🔍</span>
              Analyse {platform.charAt(0).toUpperCase() + platform.slice(1)} Reviews
              <span className="text-xs font-normal opacity-70">· ~30 seconds</span>
            </button>

            <p className="text-center text-xs mt-3" style={{ color: 'var(--text3)' }}>
              Uses 2 API credits from your ScraperAPI quota
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 animate-spin"
                style={{ borderColor: 'rgba(251,191,36,0.2)', borderTopColor: '#fbbf24' }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🛡️</div>
            </div>
            <div className="font-black" style={{ color: 'var(--text)' }}>Scanning reviews...</div>
            <div className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
              Fetching up to 100 reviews and checking for fake patterns
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {['Fetching reviews', 'Detecting patterns', 'AI analysis'].map((step, i) => (
                <div key={step} className="text-xs px-3 py-1 rounded-full border flex items-center gap-1.5"
                  style={{ borderColor: 'var(--border)', color: 'var(--text3)', background: 'var(--bg)' }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: '#fbbf24', animationDelay: `${i * 400}ms` }} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {data && !loading && (
          <div>
            {/* Trust score bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider"
                  style={{ color: 'var(--text3)' }}>
                  Overall Trust Score
                </span>
                <span className="font-black text-lg"
                  style={{ color: getTrustColor(data.trustScore).text }}>
                  {data.verdict}
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden"
                style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${data.trustScore}%`,
                    background: data.trustScore >= 75
                      ? 'linear-gradient(90deg, #059669, #34d399)'
                      : data.trustScore >= 50
                      ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                      : 'linear-gradient(90deg, #dc2626, #f87171)',
                  }} />
              </div>
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text3)' }}>
                <span>0 — Suspicious</span>
                <span>{data.trustScore}/100</span>
                <span>100 — Genuine</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-4"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              {['overview', 'red flags', 'reviews', 'ai verdict'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all"
                  style={{
                    background: activeTab === tab ? 'var(--accent)' : 'transparent',
                    color: activeTab === tab ? '#fff' : 'var(--text3)',
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Reviews analysed', value: data.stats.total, icon: '📊', color: 'blue' },
                    { label: 'Avg rating', value: `${data.stats.avgRating}★`, icon: '⭐', color: data.stats.avgRating >= 4 ? 'amber' : 'gray' },
                    { label: 'Verified buyers', value: `${data.stats.verifiedPct}%`, icon: '✅', color: data.stats.verifiedPct >= 60 ? 'green' : 'red' },
                    { label: '5-star reviews', value: `${data.stats.fiveStarPct}%`, icon: '🏆', color: data.stats.fiveStarPct > 80 ? 'red' : 'green' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl p-3 border text-center"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                      <div className="text-xl mb-1">{stat.icon}</div>
                      <div className="font-black text-lg" style={{ color: 'var(--text)' }}>{stat.value}</div>
                      <div className="text-xs" style={{ color: 'var(--text3)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Rating distribution */}
                <div className="rounded-xl p-4 border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <div className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>
                    Rating Distribution
                  </div>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = data.stats.ratingDist[star] || 0;
                    const pct = data.stats.total > 0 ? Math.round((count / data.stats.total) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 mb-2">
                        <span className="text-xs w-8 text-right flex-shrink-0" style={{ color: 'var(--text3)' }}>
                          {star}★
                        </span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: star >= 4 ? '#34d399' : star === 3 ? '#fbbf24' : '#f87171',
                            }} />
                        </div>
                        <span className="text-xs w-8 flex-shrink-0 font-bold" style={{ color: 'var(--text2)' }}>
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RED FLAGS TAB */}
            {activeTab === 'red flags' && (
              <div>
                {data.redFlags.length === 0 ? (
                  <div className="text-center py-6 rounded-xl border"
                    style={{ background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.2)' }}>
                    <div className="text-3xl mb-2">✅</div>
                    <div className="font-black" style={{ color: '#34d399' }}>No red flags detected!</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                      Reviews appear to be mostly genuine
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.redFlags.map((flag, i) => {
                      const style = getSeverityColor(flag.severity);
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl border"
                          style={{ background: style.bg, borderColor: style.border }}>
                          <span className="text-base flex-shrink-0 mt-0.5">{style.icon}</span>
                          <div>
                            <div className="font-black text-sm" style={{ color: style.text }}>{flag.flag}</div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{flag.detail}</div>
                          </div>
                          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                            {flag.severity}
                          </span>
                        </div>
                      );
                    })}

                    {data.repeatedPhrases.length > 0 && (
                      <div className="mt-2 p-3 rounded-xl border"
                        style={{ background: 'rgba(248,113,113,0.05)', borderColor: 'rgba(248,113,113,0.2)' }}>
                        <div className="text-xs font-black mb-2" style={{ color: '#f87171' }}>
                          🔁 Repeated phrases found
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.repeatedPhrases.map((p, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-lg"
                              style={{ background: 'rgba(248,113,113,0.1)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.2)' }}>
                              "{p.phrase}" ×{p.count}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SAMPLE REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                {data.sampleReviews.map((review, i) => (
                  <div key={i} className="p-3 rounded-xl border"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, s) => (
                          <span key={s} className="text-xs"
                            style={{ color: s < review.rating ? '#fbbf24' : 'var(--border)' }}>
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {review.verified ? (
                          <span className="text-xs font-bold"
                            style={{ color: '#34d399' }}>✅ Verified</span>
                        ) : (
                          <span className="text-xs"
                            style={{ color: 'var(--text3)' }}>Unverified</span>
                        )}
                      </div>
                    </div>
                    {review.title && (
                      <div className="font-bold text-xs mb-1" style={{ color: 'var(--text)' }}>
                        {review.title}
                      </div>
                    )}
                    <div className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                      {review.body.substring(0, 150)}
                      {review.body.length > 150 ? '...' : ''}
                    </div>
                    {review.date && (
                      <div className="text-[10px] mt-1" style={{ color: 'var(--text3)' }}>
                        {review.date}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* AI VERDICT TAB */}
            {activeTab === 'ai verdict' && (
              <div>
                {data.aiVerdict ? (
                  <div className="p-4 rounded-2xl border"
                    style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🤖</span>
                      <div className="text-xs font-black uppercase tracking-wider"
                        style={{ color: '#fbbf24' }}>
                        AI Analysis by Smarty
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                      {data.aiVerdict}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6" style={{ color: 'var(--text3)' }}>
                    <div className="text-3xl mb-2">🤖</div>
                    <div className="text-sm">AI verdict unavailable — check GROQ_API_KEY</div>
                  </div>
                )}

                {data.analyzedAt && (
                  <div className="text-center text-xs mt-4" style={{ color: 'var(--text3)' }}>
                    Analysed on {new Date(data.analyzedAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {' · Results cached for 24 hours'}
                  </div>
                )}
              </div>
            )}

            {/* Re-analyse button */}
            <button
              onClick={() => { setData(null); setError(''); }}
              className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold border transition-all hover:border-amber-500/40 hover:bg-amber-500/5"
              style={{ borderColor: 'var(--border)', color: 'var(--text3)', background: 'transparent' }}>
              🔄 Re-analyse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}