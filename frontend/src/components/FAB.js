'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FAB() {
  const [open, setOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const actions = [
    { icon: '📱', label: 'Phones', href: '/phones', color: 'bg-blue-600 hover:bg-blue-500' },
    { icon: '💻', label: 'Laptops', href: '/laptops', color: 'bg-violet-600 hover:bg-violet-500' },
    { icon: '🤖', label: 'Assistant', href: '/assistant', color: 'bg-green-600 hover:bg-green-500' },
    { icon: '✉️', label: 'Contact', href: '/contact', color: 'bg-orange-600 hover:bg-orange-500' },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">

      {/* Action buttons */}
      {open && (
        <div className="flex flex-col gap-2 mb-1">
          {actions.map((action, i) => (
            <Link key={action.href} href={action.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-lg transition-all hover:scale-105 ${action.color}`}
              style={{
                animation: `slideInLeft 0.2s ease ${i * 50}ms both`,
              }}>
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-white font-black text-xl transition-all hover:scale-110 ${
          open ? 'bg-red-500 hover:bg-red-400 rotate-45' : 'bg-blue-600 hover:bg-blue-500'
        }`}
        style={{ transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        {open ? '×' : '+'}
      </button>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-sm transition-all hover:scale-110 border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text2)' }}>
          ↑
        </button>
      )}
    </div>
  );
}