'use client';
import { useState, useEffect, useRef } from 'react';

const QUICK_CHIPS = [
  { icon: '🧠', text: 'What is RAM vs ROM?' },
  { icon: '🎮', text: 'Why does Snapdragon matter for gaming?' },
  { icon: '☀️', text: 'What are "Nits" and why should I care?' },
  { icon: '📺', text: 'AMOLED vs LCD — which is better?' },
  { icon: '🔋', text: 'What is mAh and how much do I need?' },
  { icon: '🛡️', text: 'What does IP68 actually mean?' },
  { icon: '📡', text: 'Do I actually need 5G right now?' },
  { icon: '🔍', text: 'How do I spot a fake review?' },
];

const GREETING = {
  role: 'assistant',
  content: `Hey there! 👋 I'm **Smarty**, your personal Tech Tutor on ComparIO.\n\nI'm here to turn confusing specs into plain English — so you stop Googling and start buying with confidence. 🚀\n\nAsk me anything about phones, laptops, or specs!`,
};

export default function Smarty({ context = {} }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [unread, setUnread] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setUnread(0);
    }
  }, [open]);

  // Proactive toast after 15 seconds on page
  useEffect(() => {
    const t = setTimeout(() => {
      if (!open) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
    }, 15000);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    setShowChips(false);
    setLoading(true);

    const userMsg = { role: 'user', content: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      const apiMessages = updatedMessages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, context }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        if (!open) {
          setUnread(prev => prev + 1);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Oops! Something went wrong on my end. Try again? 😅",
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Can't reach the server right now. Make sure your backend is running! 🔌",
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([GREETING]);
    setShowChips(true);
    setInput('');
  };

  // Format markdown-like bold text
  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      <style>{`
        @keyframes smarty-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.05); }
        }
        @keyframes smarty-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes smarty-toast {
          0% { opacity: 0; transform: translateX(20px); }
          15% { opacity: 1; transform: translateX(0); }
          85% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(20px); }
        }
        @keyframes typing-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .smarty-bounce { animation: smarty-bounce 3s ease-in-out infinite; }
        .smarty-slide-up { animation: smarty-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
        .smarty-toast { animation: smarty-toast 5s ease forwards; }
        .typing-dot { animation: typing-dot 1.2s ease-in-out infinite; }
        .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
      `}</style>

      {/* PROACTIVE TOAST */}
      {showToast && !open && (
        <div className="smarty-toast fixed bottom-24 right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(16,16,32,0.97), rgba(30,27,60,0.97))',
            border: '1px solid rgba(99,102,241,0.4)',
            backdropFilter: 'blur(20px)',
            maxWidth: '280px',
          }}>
          <span className="text-xl flex-shrink-0">🤖</span>
          <div>
            <div className="text-xs font-black text-white">Confused by the jargon?</div>
            <div className="text-xs" style={{ color: 'rgba(167,139,250,0.8)' }}>Ask Smarty! I speak Human. 😄</div>
          </div>
          <button
            onClick={() => { setShowToast(false); setOpen(true); }}
            className="text-xs font-black px-2.5 py-1.5 rounded-lg flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.3)', color: '#a78bfa' }}>
            Chat →
          </button>
        </div>
      )}

      {/* CHAT WINDOW */}
      {open && (
        <div className="smarty-slide-up fixed bottom-24 right-6 z-50 flex flex-col rounded-3xl overflow-hidden shadow-2xl"
          style={{
            width: '360px',
            height: '520px',
            background: 'rgba(8,8,20,0.97)',
            border: '1px solid rgba(99,102,241,0.35)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 24px 64px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)',
          }}>

          {/* HEADER */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(99,102,241,0.2)', background: 'rgba(16,14,32,0.9)' }}>
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                🤖
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2"
                style={{ borderColor: 'rgba(8,8,20,0.97)' }}>
                <div className="w-full h-full rounded-full bg-emerald-400 pulse-ring absolute inset-0" />
              </div>
            </div>
            <div className="flex-1">
              <div className="font-black text-sm text-white">Smarty</div>
              <div className="text-[10px] font-bold" style={{ color: '#34d399' }}>
                Online & Learning 🟢
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs hover:bg-white/10 transition"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                title="Clear chat">
                🗑️
              </button>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm hover:bg-white/10 transition"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                ✕
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-4 py-3 chat-scroll space-y-3">

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    🤖
                  </div>
                )}
                <div
                  className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
                  style={msg.role === 'user' ? {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: '#fff',
                    borderBottomRightRadius: '6px',
                  } : {
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    borderBottomLeftRadius: '6px',
                  }}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
                />
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  🤖
                </div>
                <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderBottomLeftRadius: '6px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i}
                      className="w-1.5 h-1.5 rounded-full typing-dot"
                      style={{ background: '#a78bfa', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK CHIPS */}
          {showChips && messages.length <= 1 && (
            <div className="px-4 pb-2 flex-shrink-0">
              <div className="text-[10px] font-black uppercase tracking-widest mb-2"
                style={{ color: 'rgba(167,139,250,0.6)' }}>
                Quick questions
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHIPS.slice(0, 4).map((chip, i) => (
                  <button key={i}
                    onClick={() => sendMessage(chip.text)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      color: '#a78bfa',
                    }}>
                    <span>{chip.icon}</span>
                    <span>{chip.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT */}
          <div className="px-3 pb-3 pt-2 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="flex items-end gap-2 rounded-2xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about any tech spec..."
                rows={1}
                className="flex-1 bg-transparent text-xs outline-none resize-none"
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  maxHeight: '80px',
                  lineHeight: '1.5',
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:scale-100"
                style={{ background: input.trim() ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255,255,255,0.1)' }}>
                <span className="text-xs">→</span>
              </button>
            </div>
            <div className="text-center text-[9px] mt-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Powered by Groq · Smarty stays on tech topics only
            </div>
          </div>
        </div>
      )}

      {/* FAB BUTTON */}
      <button
        onClick={() => { setOpen(!open); setUnread(0); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: open
            ? 'linear-gradient(135deg, #dc2626, #991b1b)'
            : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          boxShadow: open
            ? '0 8px 32px rgba(220,38,38,0.4)'
            : '0 8px 32px rgba(79,70,229,0.5), 0 0 0 4px rgba(79,70,229,0.1)',
        }}>
        {/* Pulse ring when closed */}
        {!open && (
          <div className="absolute inset-0 rounded-2xl pulse-ring"
            style={{ background: 'rgba(79,70,229,0.3)' }} />
        )}

        <span className={`text-2xl transition-all duration-300 ${!open ? 'smarty-bounce' : ''}`}>
          {open ? '✕' : '🤖'}
        </span>

        {/* Unread badge */}
        {unread > 0 && !open && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-black text-white border-2"
            style={{ borderColor: 'var(--bg)' }}>
            {unread}
          </div>
        )}
      </button>
    </>
  );
}