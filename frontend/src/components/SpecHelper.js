'use client';
import { useState } from 'react';

// Map spec terms to pre-typed questions for Smarty
const SPEC_QUESTIONS = {
  'snapdragon': 'What is Snapdragon and why does it matter for performance?',
  'dimensity': 'What is MediaTek Dimensity and how does it compare to Snapdragon?',
  'amoled': 'What is AMOLED display and why is it better than LCD?',
  'oled': 'What is OLED and why does it look so good?',
  'ltpo': 'What is LTPO display and how does it save battery?',
  'nits': 'What are Nits and why do they matter for outdoor use in India?',
  'refresh rate': 'What is refresh rate (90Hz, 120Hz, 144Hz) and do I need it?',
  'ip68': 'What does IP68 rating actually mean? Is it fully waterproof?',
  'ip67': 'What does IP67 rating mean? Can I use it in rain?',
  'ip65': 'What does IP65 rating mean for daily use?',
  'ufs': 'What is UFS storage and why is UFS 4.0 faster?',
  'vapor chamber': 'What is vapor chamber cooling and why gamers need it?',
  '5g': 'Do I actually need 5G in India right now?',
  'mah': 'What does mAh mean for battery life? How much do I need?',
  'gorilla glass': 'What is Gorilla Glass Victus and how tough is it?',
  'periscope': 'What is a periscope lens and why is it good for zoom photos?',
  'hasselblad': 'What is Hasselblad camera tuning on OnePlus phones?',
  'zeiss': 'What does Zeiss optics mean on a phone camera?',
  'leica': 'What does Leica camera tuning mean on Xiaomi phones?',
  'tensor': 'What is Google Tensor chip and what makes it special?',
  'a18': 'What is Apple A18 chip and why is it so fast?',
};

export default function SpecHelper({ term, onOpenChat }) {
  const [tooltip, setTooltip] = useState(false);
  const question = SPEC_QUESTIONS[term?.toLowerCase()] ||
    `What does "${term}" mean in smartphones?`;

  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        onClick={() => { onOpenChat && onOpenChat(question); }}
        className="ml-1 w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px] font-black align-middle transition-all hover:scale-125"
        style={{
          background: 'rgba(99,102,241,0.2)',
          border: '1px solid rgba(99,102,241,0.4)',
          color: '#a78bfa',
          cursor: 'pointer',
        }}>
        ?
      </button>
      {tooltip && (
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none"
          style={{
            background: 'rgba(16,14,32,0.97)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#a78bfa',
          }}>
          Ask Smarty about {term} →
        </span>
      )}
    </span>
  );
}