import Link from 'next/link';

const TEAM = [
  { name: 'Vishal', role: 'Founder & CEO', emoji: '👨‍💻', bio: 'Building the future of smart shopping in India.' },
  { name: 'ComparIO Bot', role: 'AI Engine', emoji: '🤖', bio: 'Crunches thousands of prices every 6 hours.' },
];

const MILESTONES = [
  { year: '2025', event: 'ComparIO founded with 25 phones' },
  { year: '2025', event: 'Laptops category added' },
  { year: '2025', event: 'AI Shopping Assistant launched' },
  { year: '2026', event: 'Price alerts & history tracking' },
  { year: '2026', event: 'Auto price scraping every 6 hours' },
  { year: 'Soon', event: 'Fashion, appliances & more categories' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen t-bg">

      {/* Hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'var(--blue-glow)' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'var(--violet-glow)' }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-5xl md:text-6xl font-black t-text tracking-tighter mb-4">
            About <span className="text-blue-400">ComparIO</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text2)' }}>
            We built ComparIO because we were tired of spending hours comparing prices across multiple tabs.
            There had to be a better way — so we built it.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-24">

        {/* Mission */}
        <div className="t-card rounded-3xl p-10 mb-8 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-2xl font-black t-text mb-3">Our Mission</h2>
          <p className="text-lg leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--text2)' }}>
            To make every Indian shopper <strong style={{ color: 'var(--text)' }}>confident</strong> they're getting the best deal —
            without wasting hours comparing prices across 6 different websites.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { val: '23+', label: 'Phones listed', icon: '📱' },
            { val: '15+', label: 'Laptops listed', icon: '💻' },
            { val: '2', label: 'Platforms tracked', icon: '🛒' },
            { val: '6hr', label: 'Price update cycle', icon: '⏱️' },
          ].map(s => (
            <div key={s.label} className="t-card rounded-2xl p-5 text-center hover:border-blue-500/30 hover:scale-105 transition-all">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black text-blue-400">{s.val}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="t-card rounded-3xl p-8 mb-8">
          <h2 className="text-xl font-black t-text mb-6">Our Journey</h2>
          <div className="flex flex-col gap-0">
            {MILESTONES.map((m, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 transition-transform group-hover:scale-150 ${m.year === 'Soon' ? 'bg-violet-500' : 'bg-blue-500'}`} />
                  {i < MILESTONES.length - 1 && (
                    <div className="w-0.5 flex-1 my-1" style={{ background: 'var(--border)' }} />
                  )}
                </div>
                <div className="pb-5">
                  <span className={`text-xs font-black uppercase tracking-wider ${m.year === 'Soon' ? 'text-violet-400' : 'text-blue-400'}`}>
                    {m.year}
                  </span>
                  <div className="text-sm font-bold mt-0.5 t-text">{m.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-8">
          <h2 className="text-xl font-black t-text mb-4">The Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEAM.map(member => (
              <div key={member.name} className="t-card rounded-2xl p-6 flex items-center gap-4 hover:border-blue-500/30 hover:scale-[1.02] transition-all">
                <div className="text-5xl">{member.emoji}</div>
                <div>
                  <div className="font-black t-text">{member.name}</div>
                  <div className="text-xs text-blue-400 font-bold mb-1">{member.role}</div>
                  <div className="text-xs" style={{ color: 'var(--text3)' }}>{member.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="t-card rounded-3xl p-10 text-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))' }}>
          <h2 className="text-2xl font-black t-text mb-3">Want to work with us?</h2>
          <p className="t-text2 text-sm mb-6">Affiliate partnerships, brand listings, or just a chat — we're open.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-2xl transition hover:scale-105">
            ✉️ Get in Touch
          </Link>
        </div>
      </div>
    </main>
  );
}