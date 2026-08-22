'use client';

import { useLayoutEffect, useRef } from 'react';
import { useScrollSub } from '../lib/scroll';

export default function Reveal({ as: Tag = 'div', className = '', children, delay = 0 }) {
  const elRef = useRef(null);
  const cacheRef = useRef({ top: 0, height: 0 });

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const scrollY = window.__lenis?.scroll || window.scrollY || 0;
      cacheRef.current = {
        top: rect.top + scrollY,
        height: rect.height,
      };
    };

    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure);

    return () => window.removeEventListener('resize', measure);
  }, []);

  useScrollSub(({ y }) => {
    const el = elRef.current;
    if (!el) return;

    const { top } = cacheRef.current;
    const vh = window.innerHeight;
    const distance = (y + vh * 0.9) - top;

    if (distance > 0) {
      el.style.opacity = '1';
      el.style.transform = 'translate3d(0, 0, 0)';
    } else {
      el.style.opacity = '0.05';
      el.style.transform = 'translate3d(0, 24px, 0)';
    }
  });

  return (
    <Tag
      ref={elRef}
      className={`reveal-elem ${className}`}
      style={{
        transition: `opacity 900ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 900ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}
