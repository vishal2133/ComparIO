'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── QUESTIONS ────────────────────────────────────────────────────────────────

const PHONE_QUESTIONS = [
  {
    id: 'budget',
    question: "What's your budget?",
    subtitle: 'We\'ll find the best value within your range',
    type: 'select',
    icon: '💰',
    options: [
      { label: 'Under ₹15,000', value: 15000, hint: 'Great basics' },
      { label: '₹15,000 – ₹30,000', value: 30000, hint: 'Sweet spot' },
      { label: '₹30,000 – ₹60,000', value: 60000, hint: 'Feature-rich' },
      { label: '₹60,000 – ₹1,00,000', value: 100000, hint: 'Flagship tier' },
      { label: 'Above ₹1,00,000', value: 200000, hint: 'Best of best' },
    ],
    meta: { field: 'budget' },
  },
  {
    id: 'charger',
    question: 'How many times a day do you look for your charger?',
    subtitle: "We'll find your real battery needs",
    type: 'select',
    icon: '🔋',
    options: [
      { label: 'Never — I charge once and forget', value: 'low', hint: 'Standard battery is fine' },
      { label: 'Once or twice — pretty manageable', value: 'med', hint: 'Good battery needed' },
      { label: '3+ times — always hunting for a socket', value: 'high', hint: '6000mAh+ or fast charging' },
    ],
    meta: { field: 'battery_need' },
  },
  {
    id: 'durability',
    question: 'Are you a "Screen Protector" person or a "Living on the Edge" person?',
    subtitle: "Tells us how much durability matters",
    type: 'select',
    icon: '🛡️',
    options: [
      { label: '🛡️ Screen Protector + Case always', value: 'low', hint: 'Durability less critical' },
      { label: '🤷 Sometimes careful, sometimes not', value: 'med', hint: 'Basic protection needed' },
      { label: '🔥 Living on the Edge — no case ever', value: 'high', hint: 'Gorilla Glass + IP68 essential' },
    ],
    meta: { field: 'durability_need' },
  },
  {
    id: 'content',
    question: "What's your go-to content?",
    subtitle: 'Reels person or Netflix binge-watcher?',
    type: 'select',
    icon: '📱',
    options: [
      { label: '📸 Reels / TikTok / Shorts all day', value: 'reels', hint: 'Selfie camera + stabilization' },
      { label: '🎬 Netflix / YouTube on a big screen', value: 'netflix', hint: 'OLED display + brightness' },
      { label: '🎮 Mobile gaming mostly', value: 'gaming', hint: 'High refresh rate + cooling' },
      { label: '📞 Calls, WhatsApp, basics', value: 'basic', hint: 'Balanced all-rounder' },
    ],
    meta: { field: 'content_type' },
  },
  {
    id: 'sunlight',
    question: 'Do you often use your phone in direct sunlight?',
    subtitle: 'Like navigating on a bike or using it outdoors',
    type: 'select',
    icon: '☀️',
    options: [
      { label: '✅ Yes — outdoor use is common for me', value: 'yes', hint: '2000+ nits brightness' },
      { label: '❌ No — mostly indoors', value: 'no', hint: 'Standard brightness is fine' },
    ],
    meta: { field: 'sunlight_use' },
  },
  {
    id: 'reliability',
    question: 'If your phone was a car, would it be...',
    subtitle: 'Tells us if you want longevity or raw speed',
    type: 'select',
    icon: '🚗',
    options: [
      { label: '🚙 A reliable SUV — consistent, long-lasting', value: 'suv', hint: 'Long software support (Samsung/Pixel)' },
      { label: '🏎️ A sports car — fast, powerful, thrilling', value: 'sports', hint: 'Snapdragon 8 Elite performance' },
    ],
    meta: { field: 'reliability_vs_performance' },
  },
  {
    id: 'tabs',
    question: 'How many apps or browser tabs do you keep open at once?',
    subtitle: "The honest way to find your RAM needs",
    type: 'select',
    icon: '🧠',
    options: [
      { label: '📱 Just a few — I close apps regularly', value: 'low', hint: '6GB RAM is enough' },
      { label: '📋 Some open — close them occasionally', value: 'med', hint: '8GB RAM recommended' },
      { label: '🔥 I never close anything — ever', value: 'high', hint: '12GB/16GB RAM essential' },
    ],
    meta: { field: 'ram_need' },
  },
  {
    id: 'customize',
    question: 'Do you like to customize your phone or want it to Just Work?',
    subtitle: 'The real Android vs iOS question',
    type: 'select',
    icon: '⚙️',
    options: [
      { label: '✨ Just Work — clean, simple, reliable', value: 'just_work', hint: 'iOS or Stock Android (Pixel)' },
      { label: '🎨 Customize everything — my phone, my rules', value: 'customize', hint: 'Samsung OneUI or Nothing OS' },
      { label: '🤷 Don\'t mind either way', value: 'any', hint: 'We\'ll pick the best overall' },
    ],
    meta: { field: 'os_pref' },
  },
  {
    id: 'camera_style',
    question: 'When you take photos, do you zoom in or take wide group shots?',
    subtitle: 'Helps us find the right camera setup',
    type: 'select',
    icon: '📷',
    options: [
      { label: '🔭 Zoom in on far-away things', value: 'zoom', hint: 'Telephoto lens priority' },
      { label: '👥 Wide group shots and landscapes', value: 'wide', hint: 'Ultra-wide lens quality' },
      { label: '🤳 Selfies are my thing', value: 'selfie', hint: 'Front camera + stabilization' },
      { label: '📷 All of the above equally', value: 'balanced', hint: 'Versatile main camera' },
    ],
    meta: { field: 'camera_style' },
  },
  {
    id: 'budget_flex',
    question: 'If you found the perfect phone ₹2,000 over budget, would you jump?',
    subtitle: 'Sets your flexibility range for better matches',
    type: 'select',
    icon: '🤔',
    options: [
      { label: '🚫 No — my budget is my budget', value: 'strict', hint: 'Hard budget cap' },
      { label: '🤏 Maybe if it\'s significantly better', value: 'flexible', hint: '+10% flexibility' },
      { label: '💸 Yes — worth it for the right phone', value: 'very_flexible', hint: '+15% flexibility' },
    ],
    meta: { field: 'budget_flex' },
  },
];

const LAPTOP_QUESTIONS = [
  {
    id: 'budget',
    question: "What's your budget?",
    subtitle: "We'll find the best laptop in your range",
    type: 'select',
    icon: '💰',
    options: [
      { label: 'Under ₹40,000', value: 40000, hint: 'Everyday essentials' },
      { label: '₹40,000 – ₹70,000', value: 70000, hint: 'Great all-rounder' },
      { label: '₹70,000 – ₹1,20,000', value: 120000, hint: 'Premium performance' },
      { label: 'Above ₹1,20,000', value: 300000, hint: 'No compromises' },
    ],
    meta: { field: 'budget' },
  },
  {
    id: 'primary_use',
    question: "What will you mainly use the laptop for?",
    subtitle: 'The single most important question',
    type: 'select',
    icon: '🎯',
    options: [
      { label: '🎓 College / Student work', value: 'student', hint: 'Battery + portability first' },
      { label: '🎮 Gaming', value: 'gaming', hint: 'GPU + cooling priority' },
      { label: '🎨 Video editing / Creative work', value: 'creative', hint: 'Display + RAM + GPU' },
      { label: '💻 Programming / Coding', value: 'programming', hint: 'Performance + keyboard' },
      { label: '💼 Business / Office / Calls', value: 'business', hint: 'Portability + battery' },
    ],
    meta: { field: 'primary_use' },
  },
  {
    id: 'os',
    question: 'Windows or macOS?',
    subtitle: 'Both have their strengths',
    type: 'select',
    icon: '💻',
    options: [
      { label: "🪟 Windows — I know it, I like it", value: 'windows', hint: 'More choice, gaming support' },
      { label: "🍎 macOS — clean, fast, reliable", value: 'macos', hint: 'Best battery, best build' },
      { label: "🤷 Open to either", value: 'any', hint: "We'll pick the best overall" },
    ],
    meta: { field: 'os' },
  },
  {
    id: 'portability',
    question: 'Do you carry your laptop everywhere or mostly use it at a desk?',
    subtitle: 'Determines weight and battery priority',
    type: 'select',
    icon: '🎒',
    options: [
      { label: '🎒 Always carrying it — classes, cafes, everywhere', value: 'high', hint: 'Under 1.5kg, 12hr+ battery' },
      { label: '🏠 Mostly at desk, occasional travel', value: 'med', hint: 'Balanced weight OK' },
      { label: '🖥️ Permanently on my desk — plugged in mostly', value: 'low', hint: 'Performance over portability' },
    ],
    meta: { field: 'portability_need' },
  },
  {
    id: 'display',
    question: "How important is display quality to you?",
    subtitle: 'OLED displays are significantly better but cost more',
    type: 'select',
    icon: '🖥️',
    options: [
      { label: '🎨 Critical — I edit photos/videos on it', value: 'critical', hint: 'OLED or high-color-accuracy IPS' },
      { label: '🎬 I watch a lot of movies/shows on it', value: 'high', hint: 'High brightness + good contrast' },
      { label: '📝 Just for documents and browsing', value: 'basic', hint: 'Standard IPS is fine' },
    ],
    meta: { field: 'display_need' },
  },
  {
    id: 'gaming',
    question: 'Will you game on this laptop?',
    subtitle: 'Even casual gaming needs a decent GPU',
    type: 'select',
    icon: '🎮',
    options: [
      { label: '🎮 Yes — AAA games or heavy titles', value: 'heavy', hint: 'RTX 4060+ required' },
      { label: '🕹️ Casual — Minecraft, Valorant, indie games', value: 'casual', hint: 'RTX 4050 or Arc Graphics' },
      { label: '❌ No gaming at all', value: 'none', hint: 'Integrated graphics fine' },
    ],
    meta: { field: 'gaming_need' },
  },
  {
    id: 'battery',
    question: 'How do you feel about carrying a charger everywhere?',
    subtitle: 'Sets your battery life expectations',
    type: 'select',
    icon: '🔋',
    options: [
      { label: '😤 Hate it — I want all-day battery', value: 'high', hint: '12+ hours essential' },
      { label: '🤷 Fine if it lasts 6-8 hours', value: 'med', hint: 'Standard laptop battery OK' },
      { label: '😌 Always near a socket — no problem', value: 'low', hint: 'Battery not priority' },
    ],
    meta: { field: 'battery_need' },
  },
  {
    id: 'build',
    question: 'Do you care about how premium the laptop feels?',
    subtitle: 'Metal builds vs plastic — big price difference',
    type: 'select',
    icon: '✨',
    options: [
      { label: '💎 Yes — I want it to feel premium and look great', value: 'high', hint: 'Metal chassis, slim bezels' },
      { label: '🤷 Somewhat — decent quality is enough', value: 'med', hint: 'Polycarbonate with metal accents' },
      { label: '🔧 No — just needs to work well', value: 'low', hint: 'Plastic is fine for performance' },
    ],
    meta: { field: 'build_need' },
  },
  {
    id: 'multitask',
    question: 'Do you run heavy software or just browser + documents?',
    subtitle: 'Tells us how much RAM and CPU you really need',
    type: 'select',
    icon: '⚡',
    options: [
      { label: '🐘 Heavy — Figma, DaVinci, VMs, many apps at once', value: 'heavy', hint: '32GB RAM, powerful CPU' },
      { label: '🎯 Medium — coding, some design, lots of tabs', value: 'med', hint: '16GB RAM recommended' },
      { label: '🌐 Light — browser, docs, streaming', value: 'light', hint: '8GB RAM is enough' },
    ],
    meta: { field: 'multitask' },
  },
  {
    id: 'budget_flex',
    question: 'If the perfect laptop is ₹3,000 over budget, do you go for it?',
    subtitle: 'Helps us show slightly better options if they exist',
    type: 'select',
    icon: '🤔',
    options: [
      { label: '🚫 No — strict budget only', value: 'strict', hint: 'Hard cap' },
      { label: '💡 Yes, if it\'s clearly better', value: 'flexible', hint: '+10% flexibility' },
      { label: '💸 Absolutely — worth it', value: 'very_flexible', hint: '+15% flexibility' },
    ],
    meta: { field: 'budget_flex' },
  },
];

// ─── ANSWER PROCESSOR ──────────────────────────────────────────────────────────

const processAnswers = (answers, category) => {
  const priorities = [];
  const tags = [];
  let budgetMultiplier = 1;

  if (category === 'phone') {
    // Battery priority
    if (answers.charger === 'high') { priorities.push('battery'); tags.push('battery'); }
    // Durability
    if (answers.durability === 'high') tags.push('durability');
    // Content type
    if (answers.content === 'reels') { priorities.push('camera'); tags.push('photography'); }
    if (answers.content === 'netflix') { priorities.push('display'); tags.push('premium'); }
    if (answers.content === 'gaming') { priorities.push('performance'); tags.push('gaming'); }
    // Sunlight
    if (answers.sunlight === 'yes') tags.push('sunlight');
    // Performance
    if (answers.reliability === 'sports') { priorities.push('performance'); tags.push('gaming'); }
    // RAM need
    if (answers.tabs === 'high') priorities.push('performance');
    // OS preference
    if (answers.customize === 'just_work') tags.push('ios');
    if (answers.customize === 'customize') tags.push('android');
    // Camera style
    if (answers.camera_style === 'zoom') tags.push('zoom');
    if (answers.camera_style === 'selfie') tags.push('photography');
    // Budget flex
    if (answers.budget_flex === 'flexible') budgetMultiplier = 1.10;
    if (answers.budget_flex === 'very_flexible') budgetMultiplier = 1.15;
    // Fill priorities to have at least 2
    const fallback = ['camera', 'battery', 'performance', 'display', 'value'];
    for (const p of fallback) {
      if (priorities.length >= 2) break;
      if (!priorities.includes(p)) priorities.push(p);
    }
  } else {
    // Laptop
    if (answers.primary_use === 'gaming') { priorities.push('performance'); tags.push('gaming'); }
    if (answers.primary_use === 'creative') { priorities.push('display'); priorities.push('performance'); tags.push('creative'); }
    if (answers.primary_use === 'programming') { priorities.push('performance'); tags.push('programming'); }
    if (answers.primary_use === 'student') { priorities.push('battery'); priorities.push('portability'); tags.push('student'); }
    if (answers.primary_use === 'business') { priorities.push('portability'); priorities.push('battery'); tags.push('business'); }
    if (answers.portability_need === 'high') { priorities.push('portability'); }
    if (answers.battery_need === 'high') { priorities.push('battery'); }
    if (answers.gaming_need === 'heavy') { tags.push('gaming'); }
    if (answers.build_need === 'high') { tags.push('premium'); }
    if (answers.budget_flex === 'flexible') budgetMultiplier = 1.10;
    if (answers.budget_flex === 'very_flexible') budgetMultiplier = 1.15;
    const fallback = ['performance', 'battery', 'display', 'portability', 'value'];
    for (const p of fallback) {
      if (priorities.length >= 2) break;
      if (!priorities.includes(p)) priorities.push(p);
    }
  }

  return {
    priorities: [...new Set(priorities)].slice(0, 2),
    tags: [...new Set(tags)],
    budgetMultiplier,
    os: answers.os || answers.customize === 'just_work' ? 'any' : 'any',
    budget: Math.round(answers.budget * budgetMultiplier),
    originalBudget: answers.budget,
  };
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function AssistantPage() {
  const [stage, setStage] = useState('home'); // home | questions | loading | results | error
  const [category, setCategory] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 4,
      size: 4 + Math.random() * 8,
    })));
  }, []);

  const questions = category === 'phone' ? PHONE_QUESTIONS : LAPTOP_QUESTIONS;
  const currentQ = questions[step];
  const progress = (step / questions.length) * 100;
  const formatPrice = (p) => '₹' + p.toLocaleString('en-IN');

  const handleStart = (cat) => {
    setCategory(cat);
    setStage('questions');
    setStep(0);
    setAnswers({});
  };

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers) => {
    setStage('loading');
    const processed = processAnswers(finalAnswers, category);
    try {
      const body = {
        category,
        budget: processed.budget,
        priorities: processed.priorities,
        usage: processed.tags,
        os: processed.os,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setResults({ ...data, processed });
        setStage('results');
      } else {
        setError(data.message || 'No matches found. Try a higher budget.');
        setStage('error');
      }
    } catch (err) {
      setError('Connection failed. Make sure your backend is running.');
      setStage('error');
    }
  };

  const reset = () => {
    setStage('home');
    setCategory(null);
    setStep(0);
    setAnswers({});
    setResults(null);
    setError(null);
  };

  // ─── HOME ─────────────────────────────────────────────────────────────────

  if (stage === 'home') {
    return (
      <main className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-gray-950 to-purple-950" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59,130,246,0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(139,92,246,0.15) 0%, transparent 50%)`
        }} />

        {/* Floating particles */}
        {particles.map((p) => (
          <div key={p.id} className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              left: `${p.left}%`, top: `${p.top}%`,
              width: p.size, height: p.size,
              background: p.id % 2 === 0 ? '#3b82f6' : '#8b5cf6',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
          {/* Header */}
          <div className="text-center mb-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
              AI-Powered Shopping Assistant
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none">
              Stop wasting
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                hours searching.
              </span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Answer 10 smart questions. Get your perfect match in 60 seconds.
              No specs knowledge needed.
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mb-12">
            <button
              onClick={() => handleStart('phone')}
              className="group relative t-input border t-border rounded-3xl p-8 text-left hover:bg-blue-500/10 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="text-5xl mb-4">📱</div>
              <div className="font-black text-xl text-white mb-1">Find a Phone</div>
              <div className="text-gray-400 text-sm">iPhones, Android & more</div>
              <div className="mt-4 text-blue-400 text-xs font-bold group-hover:translate-x-1 transition-transform">
                Start →
              </div>
            </button>
            <button
              onClick={() => handleStart('laptop')}
              className="group relative t-input border t-border rounded-3xl p-8 text-left hover:bg-purple-500/10 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="text-5xl mb-4">💻</div>
              <div className="font-black text-xl text-white mb-1">Find a Laptop</div>
              <div className="text-gray-400 text-sm">Windows, MacBooks & more</div>
              <div className="mt-4 text-purple-400 text-xs font-bold group-hover:translate-x-1 transition-transform">
                Start →
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 text-center">
            {[
              { val: '10', label: 'Smart questions' },
              { val: '60s', label: 'To your answer' },
              { val: '100%', label: 'Free to use' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">{s.val}</div>
                <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ─── LOADING ──────────────────────────────────────────────────────────────

  if (stage === 'loading') {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-blue-500/50 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
          </div>
          <div className="font-black text-2xl mb-2">Analysing your needs...</div>
          <div className="text-gray-400 text-sm">Finding the best {category} for you</div>
        </div>
      </main>
    );
  }

  // ─── ERROR ────────────────────────────────────────────────────────────────

  if (stage === 'error') {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center text-white max-w-sm">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-black mb-2">No matches found</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button onClick={reset}
            className="bg-blue-600 text-white font-black px-6 py-3 rounded-xl hover:bg-blue-700 transition">
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // ─── RESULTS ─────────────────────────────────────────────────────────────

  if (stage === 'results') {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1.5 text-green-300 text-xs font-bold uppercase tracking-widest mb-4">
              ✓ Found your perfect match
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Here's what we recommend
            </h1>
            <p className="text-gray-400 text-sm">
              Based on your answers — budget up to{' '}
              <span className="text-white font-bold">
                {formatPrice(results.processed.budget)}
              </span>
            </p>
          </div>

          {/* AI Summary */}
          {results.summary && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl px-5 py-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">🤖</div>
                <div>
                  <div className="text-xs font-black text-blue-400 uppercase tracking-wide mb-1">
                    AI Analysis
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{results.summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="flex flex-col gap-4 mb-8">
            {results.data.map((product, index) => (
              <div
                key={product._id}
                className={`rounded-2xl border p-5 transition ${
                  index === 0
                    ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/40'
                    : 't-input t-border'
                }`}
              >
                {index === 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white text-xs font-black px-3 py-1 rounded-full mb-3">
                    ⭐ TOP PICK
                  </div>
                )}
                {index === 1 && (
                  <div className="inline-flex items-center gap-1.5 bg-white/10 text-gray-300 text-xs font-black px-3 py-1 rounded-full mb-3">
                    🥈 RUNNER UP
                  </div>
                )}
                {index === 2 && (
                  <div className="inline-flex items-center gap-1.5 bg-white/10 text-gray-300 text-xs font-black px-3 py-1 rounded-full mb-3">
                    🥉 ALSO GREAT
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 rounded-xl p-2 flex-shrink-0">
                    <img src={product.image} alt={product.name}
                      className="w-16 h-16 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 mb-0.5">{product.brand}</div>
                    <div className="font-black text-white text-base leading-tight mb-2">
                      {product.name}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.tags?.slice(0, 3).map((tag) => (
                        <span key={tag}
                          className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-blue-400">
                        {formatPrice(product.bestPrice)}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        on {product.bestPlatform}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className={`px-4 py-2 rounded-xl font-black text-xs flex-shrink-0 transition ${
                      index === 0
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={reset}
              className="flex-1 border border-white/20 text-gray-400 font-bold py-3 rounded-xl hover:border-white/40 hover:text-white transition text-sm">
              ← Try Again
            </button>
            <Link href="/phones"
              className="flex-1 bg-white text-gray-900 font-black py-3 rounded-xl hover:bg-gray-200 transition text-sm text-center">
              Browse All →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── QUESTIONS ────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6 py-10">
      <div className="max-w-lg w-full">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span className="font-bold text-gray-400">
              Question {step + 1} <span className="t-text2">/ {questions.length}</span>
            </span>
            <button onClick={reset} className="hover:text-red-400 transition">✕ Start over</button>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="t-input border t-border rounded-3xl p-8 mb-4">
          <div className="text-4xl mb-4">{currentQ.icon}</div>
          <div className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">
            {category === 'phone' ? '📱 Phone Assistant' : '💻 Laptop Assistant'}
          </div>
          <h2 className="text-xl font-black text-white mb-2 leading-snug">
            {currentQ.question}
          </h2>
          <p className="text-sm text-gray-500 mb-6">{currentQ.subtitle}</p>

          <div className="flex flex-col gap-2">
            {currentQ.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className="group text-left px-5 py-4 rounded-2xl border t-border t-input hover:bg-blue-500/10 hover:border-blue-500/40 transition-all duration-200"
              >
                <div className="font-bold text-white text-sm group-hover:text-blue-300 transition">
                  {opt.label}
                </div>
                {opt.hint && (
                  <div className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-400 transition">
                    {opt.hint}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Back button */}
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full text-center text-sm t-text2 hover:text-gray-400 transition py-2"
          >
            ← Previous question
          </button>
        )}
      </div>
    </main>
  );
}