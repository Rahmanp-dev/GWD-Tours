'use client';

import { useEffect, useRef, useState } from 'react';

export default function Cursor() {
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState('');
  const dotRef = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!active) setActive(true);

      const target = e.target.closest('[data-cursor]');
      if (target) {
        setLabel(target.getAttribute('data-cursor') || '');
      } else {
        setLabel('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let rafId;
    const loop = () => {
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={dotRef} className={`custom-cursor ${label ? 'has-label' : ''}`} aria-hidden="true">
      <div className="cursor-ring" />
      <div className="cursor-dot" />
      {label && <span className="cursor-label">{label}</span>}
    </div>
  );
}
