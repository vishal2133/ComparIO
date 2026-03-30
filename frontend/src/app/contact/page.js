'use client';
import { useState } from 'react';
import Link from 'next/link';

const TOPICS = ['General Query', 'Price Error', 'Product Not Found', 'Affiliate / Partnership', 'Bug Report', 'Other'];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setStatus('success');
    setLoading(false);
  };

  const inputStyle = (field) => ({
    background: 'var(--input-bg)',
    border: `1px solid ${focused === field ? 'rgba(59,130,246,0.5)' : 'var(--border)'}`,
    color: 'var(--text)',
    outline: 'none',
    width: '100%',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    transition: 'all 0.2s',
    boxShadow: focused === field ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
  });

  if (status === 'success') {
    return (
      <main className="min-h-screen t-bg flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-6 animate-bounce">✉️</div>
          <h2 className="text-3xl font-black t-text mb-3">Message sent!</h2>
          <p className="t-text2 text-sm mb-8 leading-relaxed">
            Thanks for reaching out, <strong style={{ color: 'var(--text)' }}>{form.name}</strong>!
            We'll get back to you at <strong style={{ color: 'var(--text)' }}>{form.email}</strong> within 24–48 hours.
          </p>
          <Link href="/"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-2xl transition hover:scale-105">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen t-bg">

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full blur-3xl" style={{ background: 'var(--blue-glow)' }} />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full blur-3xl" style={{ background: 'var(--violet-glow)' }} />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6"
            style={{ borderColor: 'var(--border)', color: 'var(--text3)', background: 'var(--surface)' }}>
            ✉️ Contact Us
          </div>
          <h1 className="text-5xl font-black t-text tracking-tighter mb-4">
            We'd love to<br />
            <span className="text-blue-400">hear from you</span>
          </h1>
          <p className="t-text2 text-lg leading-relaxed">
            Found a wrong price? Want to partner with us? Just say hi — we read every message.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Contact Info Cards */}
          <div className="flex flex-col gap-4">
            {[
              {
                icon: '📧', title: 'Email Us',
                value: 'hello@compario.in',
                sub: 'We reply within 24 hours',
                color: 'text-blue-400', bg: 'bg-blue-500/10',
              },
              {
                icon: '📸', title: 'Instagram',
                value: '@compario.in',
                sub: 'DM us for quick support',
                color: 'text-pink-400', bg: 'bg-pink-500/10',
                href: 'https://instagram.com',
              },
              {
                icon: '𝕏', title: 'Twitter / X',
                value: '@ComparioIN',
                sub: 'Follow for deal alerts',
                color: 'text-sky-400', bg: 'bg-sky-500/10',
                href: 'https://twitter.com',
              },
              {
                icon: '👥', title: 'Facebook',
                value: 'ComparIO India',
                sub: 'Join our community',
                color: 'text-blue-400', bg: 'bg-blue-600/10',
                href: 'https://facebook.com',
              },
            ].map(card => (
              <a key={card.title}
                href={card.href || '#'}
                target={card.href ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="group t-card rounded-2xl p-5 flex items-start gap-4 hover:border-blue-500/30 hover:scale-[1.02] transition-all cursor-pointer">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color: 'var(--text3)' }}>{card.title}</div>
                  <div className={`font-black text-sm ${card.color}`}>{card.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{card.sub}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="t-card rounded-3xl p-8">
              <h2 className="text-2xl font-black t-text mb-1">Send a message</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text3)' }}>Fill in the form and we'll get back to you ASAP</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider block mb-2" style={{ color: 'var(--text3)' }}>
                      Your Name
                    </label>
                    <input
                      name="name" type="text" required
                      value={form.name} onChange={handleChange}
                      onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                      placeholder="Vishal Kumar"
                      style={inputStyle('name')}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider block mb-2" style={{ color: 'var(--text3)' }}>
                      Email Address
                    </label>
                    <input
                      name="email" type="email" required
                      value={form.email} onChange={handleChange}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                      placeholder="you@example.com"
                      style={inputStyle('email')}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider block mb-2" style={{ color: 'var(--text3)' }}>
                    Topic
                  </label>
                  <select
                    name="topic" required
                    value={form.topic} onChange={handleChange}
                    onFocus={() => setFocused('topic')} onBlur={() => setFocused('')}
                    style={{ ...inputStyle('topic'), cursor: 'pointer' }}>
                    <option value="" disabled>Select a topic...</option>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider block mb-2" style={{ color: 'var(--text3)' }}>
                    Message
                  </label>
                  <textarea
                    name="message" required rows={5}
                    value={form.message} onChange={handleChange}
                    onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                    placeholder="Tell us what's on your mind..."
                    style={{ ...inputStyle('message'), resize: 'vertical', minHeight: '120px' }}
                  />
                  <div className="text-right text-xs mt-1" style={{ color: 'var(--text3)' }}>
                    {form.message.length}/500
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-black py-4 rounded-2xl transition-all hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>✉️ Send Message</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}