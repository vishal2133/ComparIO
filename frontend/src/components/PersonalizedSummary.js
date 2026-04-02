'use client';
import { useState, useEffect } from 'react';

export default function PersonalizedSummary({ slug }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState(null);
  const [hasAnswers, setHasAnswers] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [detailedSummary, setDetailedSummary] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('compario_assistant_answers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          setUserAnswers(parsed.answers);
          setHasAnswers(true);
        }
      }
    } catch {}
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setExpanded(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, userAnswers }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setSummary(data.summary);
      } else {
        setSummary('Unable to generate summary. Please check your API key configuration.');
      }
    } catch {
      setSummary('Connection failed. Make sure your backend is running.');
    }
    setLoading(false);
  };

  const fetchDetailedSummary = async () => {
    setLoadingDetailed(true);
    setShowModal(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, userAnswers, inDetail: true }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setDetailedSummary(data.summary);
      } else {
        setDetailedSummary('Unable to generate detailed summary. Please check your API key configuration.');
      }
    } catch {
      setDetailedSummary('Connection failed. Make sure your backend is running.');
    }
    setLoadingDetailed(false);
  };

  // Build a short "your profile" pill list
  const buildProfilePills = () => {
    if (!userAnswers) return [];
    const pills = [];
    const priorityMap = {
      camera: '📸 Camera',
      battery: '🔋 Battery',
      gaming: '🎮 Gaming',
      charging: '⚡ Fast Charging',
      display: '📱 Display',
      performance: '🧠 Performance',
      build: '🛡️ Durability',
      audio: '🎧 Audio',
    };
    const usageMap = {
      daily: '☕ Daily use',
      work: '💼 Work',
      gaming: '🎮 Gamer',
      photography: '📸 Creator',
      basic: '👵 Basic use',
    };
    if (userAnswers.budget) {
      pills.push(`💰 ₹${Number(userAnswers.budget).toLocaleString('en-IN')}`);
    }
    (userAnswers.priorities || []).forEach(p => {
      if (priorityMap[p]) pills.push(priorityMap[p]);
    });
    if (userAnswers.usage && usageMap[userAnswers.usage]) {
      pills.push(usageMap[userAnswers.usage]);
    }
    if (userAnswers.longevity) {
      pills.push(`⏳ ${userAnswers.longevity} yrs`);
    }
    return pills;
  };

  const pills = buildProfilePills();

  return (
    <div className="rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(124,58,237,0.04))' }}>

      {/* Header — always visible */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: 'rgba(99,102,241,0.12)' }}>
            🤖
          </div>
          <div>
            <div className="font-black text-base tracking-tight" style={{ color: 'var(--text)' }}>
              {hasAnswers ? 'AI Summary — Personalised for You' : 'AI Product Summary'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
              {hasAnswers
                ? 'Based on your quiz answers — why this product matches your needs'
                : 'General AI-powered summary of this product'}
            </div>
          </div>
        </div>

        {/* Profile pills */}
        {hasAnswers && pills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {pills.map((pill, i) => (
              <span key={i}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)', color: 'rgba(147,197,253,0.9)' }}>
                {pill}
              </span>
            ))}
          </div>
        )}

        {/* CTA button — before expanded */}
        {!expanded && (
          <button
            onClick={fetchSummary}
            className="w-full py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
            <span>✨</span>
            {hasAnswers
              ? 'Generate My Personalised Summary'
              : 'Generate AI Summary for this Product'}
            <span className="text-xs font-normal opacity-70">· Free</span>
          </button>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: '#818cf8', animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
              <span className="text-xs" style={{ color: 'var(--text3)' }}>
                Claude is analysing {hasAnswers ? 'your profile + ' : ''}this product...
              </span>
            </div>
            {/* Skeleton */}
            <div className="space-y-2 animate-pulse">
              <div className="h-3 rounded-full w-full" style={{ background: 'var(--border)' }} />
              <div className="h-3 rounded-full w-4/5" style={{ background: 'var(--border)' }} />
              <div className="h-3 rounded-full w-full" style={{ background: 'var(--border)' }} />
              <div className="h-3 rounded-full w-3/4" style={{ background: 'var(--border)' }} />
              <div className="h-3 rounded-full w-full" style={{ background: 'var(--border)' }} />
            </div>
          </div>
        )}

        {/* Summary result */}
        {summary && !loading && (
          <div className="mt-4">
            {/* Parse the 3 sentences and render as cards */}
            <SummaryCards text={summary} hasAnswers={hasAnswers} />

            <button
              onClick={fetchDetailedSummary}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(99,102,241,0.3)', color: 'rgba(147,197,253,0.9)', background: 'rgba(99,102,241,0.05)' }}>
              <span>🔍</span> View Detailed Specs & AI Analysis
            </button>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => { setSummary(null); setExpanded(false); }}
                className="text-xs font-bold hover:text-blue-400 transition"
                style={{ color: 'var(--text3)' }}>
                ↩ Regenerate
              </button>
              <div className="h-3 w-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--text3)' }}>
                Powered by Claude AI
              </span>
              {!hasAnswers && (
                <>
                  <div className="h-3 w-px" style={{ background: 'var(--border)' }} />
                  <a href="/assistant"
                    className="text-xs font-bold text-blue-400 hover:underline">
                    Take quiz for personalised →
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* No API key notice */}
      {!process.env.NEXT_PUBLIC_API_URL && (
        <div className="px-5 pb-4 text-xs" style={{ color: 'var(--text3)' }}>
          Configure CLAUDE_API_KEY in backend .env to enable AI summaries.
        </div>
      )}

      {/* DETAILED MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
             style={{ background: 'rgba(0,0,0,0.6)' }}
             onClick={() => setShowModal(false)}>
          <div className="rounded-3xl border shadow-2xl overflow-hidden w-full max-w-2xl max-h-[85vh] flex flex-col"
               style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
               onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div className="font-black text-lg flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <span>🧠</span> AI Spec Breakdown
              </div>
              <button onClick={() => setShowModal(false)} className="text-xl transition-transform hover:scale-110" style={{ color: 'var(--text3)' }}>
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetailed ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#818cf8', animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text2)' }}>Analysing all specifications...</div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed" style={{ color: 'var(--text2)' }}>
                  {detailedSummary?.split('\n').map((line, i) => {
                    const elements = line.split(/(\*\*.*?\*\*)/).map((part, j) => 
                      part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={j} style={{ color: 'var(--text)' }}>{part.slice(2, -2)}</strong> 
                        : part
                    );
                    return <p key={i} className={line.trim() === '' ? 'h-4' : 'mb-2'}>{elements}</p>;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Parse summary into 3 sentence cards
function SummaryCards({ text, hasAnswers }) {
  // Split by sentence endings
  const rawSentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 3);

  const cards = [
    {
      icon: '🎯',
      label: hasAnswers ? 'Why it matches you' : 'What it excels at',
      color: 'rgba(52,211,153,0.08)',
      borderColor: 'rgba(52,211,153,0.2)',
      labelColor: '#34d399',
    },
    {
      icon: '⚖️',
      label: 'Honest tradeoff',
      color: 'rgba(251,191,36,0.08)',
      borderColor: 'rgba(251,191,36,0.2)',
      labelColor: '#fbbf24',
    },
    {
      icon: '✅',
      label: 'The verdict',
      color: 'rgba(99,102,241,0.08)',
      borderColor: 'rgba(99,102,241,0.2)',
      labelColor: '#818cf8',
    },
  ];

  if (rawSentences.length === 0) {
    return (
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{text}</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rawSentences.map((sentence, i) => {
        const card = cards[i] || cards[0];
        return (
          <div key={i}
            className="rounded-xl px-4 py-3 border"
            style={{ background: card.color, borderColor: card.borderColor }}>
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">{card.icon}</span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest mb-1"
                  style={{ color: card.labelColor }}>
                  {card.label}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  {sentence}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}