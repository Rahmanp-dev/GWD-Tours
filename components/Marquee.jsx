'use client';

import { useRef } from 'react';
import { useScrollSub } from '../lib/scroll';

export default function Marquee({ text, dir = 1, speed = 0.25, tone = 'default' }) {
  const trackRef = useRef(null);

  useScrollSub(({ y }) => {
    if (!trackRef.current) return;
    const offset = (y * speed * dir) % 1200;
    trackRef.current.style.transform = `translate3d(${offset.toFixed(1)}px, 0, 0)`;
  });

  return (
    <div className={`marquee-wrap tone-${tone}`} aria-hidden="true">
      <div ref={trackRef} className="marquee-track">
        <span className="marquee-text">{text}</span>
        <span className="marquee-text">{text}</span>
        <span className="marquee-text">{text}</span>
      </div>
    </div>
  );
}
