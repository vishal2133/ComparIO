'use client';
import { useEffect, useRef } from 'react';

// ── 1. HOVER TILT — attach to any card ───────────────────────────
export function useHoverTilt(ref, intensity = 15) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `
        perspective(800px)
        rotateY(${cx * intensity}deg)
        rotateX(${-cy * intensity * 0.7}deg)
        translateZ(10px)
        scale(1.02)
      `;
    };

    const onLeave = () => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0) scale(1)';
      setTimeout(() => { el.style.transition = ''; }, 500);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);
}

// ── 3. 3D PHONE CARD ─────────────────────────────────────────────
export function use3DCard(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;

    const onMove = (e) => {
      const rect = parent.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `rotateY(${cx * 30}deg) rotateX(${-cy * 20}deg) translateZ(20px)`;
    };

    const onLeave = () => {
      el.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
      setTimeout(() => { el.style.transition = 'transform 0.1s ease-out'; }, 600);
    };

    parent.addEventListener('mousemove', onMove);
    parent.addEventListener('mouseleave', onLeave);
    return () => {
      parent.removeEventListener('mousemove', onMove);
      parent.removeEventListener('mouseleave', onLeave);
    };
  }, []);
}

// ── 4. INTERSECTION REVEAL ───────────────────────────────────────
export function useReveal(threshold = 0.1) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold });

    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}

// ── 5. RIPPLE ────────────────────────────────────────────────────
export function addRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
  `;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// ── 6. PARALLAX ──────────────────────────────────────────────────
export function useParallax(containerRef, layers) {
  // layers = { bg: ref, mid: ref, fg: ref }
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (layers.bg?.current)
        layers.bg.current.style.transform = `translate(${x * -15}px, ${y * -10}px)`;
      if (layers.mid?.current)
        layers.mid.current.style.transform = `translate(${x * 8}px, ${y * 5}px)`;
      if (layers.fg?.current)
        layers.fg.current.style.transform = `translate(${x * 20}px, ${y * 14}px)`;
    };

    const onLeave = () => {
      [layers.bg, layers.mid, layers.fg].forEach(l => {
        if (l?.current) {
          l.current.style.transition = 'transform 0.5s ease';
          l.current.style.transform = 'translate(0,0)';
          setTimeout(() => { if (l.current) l.current.style.transition = ''; }, 500);
        }
      });
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);
    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
    };
  }, []);
}

// ── 7. CUSTOM CURSOR ─────────────────────────────────────────────
export function useCustomCursor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dot = document.createElement('div');
    dot.className = 'smarty-cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'smarty-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;
    let animId;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';

      // Trail
      const trail = document.createElement('div');
      trail.className = 'cursor-trail-dot';
      trail.style.left = mouseX + 'px';
      trail.style.top = mouseY + 'px';
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 500);
    };

    // Smooth ring follow
    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      animId = requestAnimationFrame(animate);
    };
    animate();

    const onDown = () => {
      dot.style.width = '18px';
      dot.style.height = '18px';
      ring.style.width = '44px';
      ring.style.height = '44px';
    };
    const onUp = () => {
      dot.style.width = '10px';
      dot.style.height = '10px';
      ring.style.width = '30px';
      ring.style.height = '30px';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(animId);
      dot.remove();
      ring.remove();
    };
  }, []);
}