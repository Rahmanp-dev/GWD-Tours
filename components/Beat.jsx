'use client';

import { useLayoutEffect, useRef } from 'react';
import { useScrollSub } from '../lib/scroll';
import { SEGMENTS, BEATS } from '../lib/film';

export default function Beat({ beat }) {
  const elRef = useRef(null);
  const cacheRef = useRef({
    top: 0,
    height: 0,
    win: 300,
  });

  const seg = SEGMENTS.find((s) => s.id === beat.seg) || SEGMENTS[0];
  const pos = ((beat.t - seg.from) / (seg.to - seg.from)) * 100;

  // Measure offsets and compute adaptive fade window
  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const measure = () => {
      const segBeats = BEATS.filter((b) => b.seg === beat.seg);
      const idx = segBeats.findIndex((b) => b.t === beat.t);
      const prev = segBeats[idx - 1];
      const next = segBeats[idx + 1];

      let nearestT = 12.0;
      if (prev && next) {
        nearestT = Math.min(beat.t - prev.t, next.t - beat.t);
      } else if (prev) {
        nearestT = beat.t - prev.t;
      } else if (next) {
        nearestT = next.t - beat.t;
      }

      const segSpan = seg.to - seg.from;
      const segVhPx = (seg.vh / 100) * window.innerHeight;
      const fraction = (nearestT / 2) / segSpan;
      const computedWin = Math.min(
        window.innerHeight * 0.48,
        Math.max(window.innerHeight * 0.20, fraction * segVhPx)
      );

      const rect = el.getBoundingClientRect();
      const scrollY = window.__lenis?.scroll || window.scrollY || 0;
      cacheRef.current = {
        top: rect.top + scrollY,
        height: rect.height,
        win: computedWin,
      };
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.body);

    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [beat, seg]);

  // Direct DOM updates on scroll with adaptive window
  useScrollSub(({ y }) => {
    const el = elRef.current;
    if (!el) return;

    const { top, height, win } = cacheRef.current;
    const vh = window.innerHeight;
    const elemCenter = top + height / 2;
    const viewCenter = y + vh / 2;

    const delta = (elemCenter - viewCenter) / win;
    const absD = Math.abs(delta);

    // Smooth cosine fade
    const clamped = Math.min(1, Math.max(0, 1 - absD));
    const opacity = 0.5 - 0.5 * Math.cos(clamped * Math.PI);

    el.style.opacity = opacity.toFixed(3);
    el.style.transform = `translate3d(0, ${(delta * 24).toFixed(1)}px, 0)`;
    el.style.filter = opacity > 0.985 ? 'none' : `blur(${((1 - opacity) * 3.5).toFixed(1)}px)`;
    el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
  });

  return (
    <article
      ref={elRef}
      className={`beat align-${beat.align}`}
      style={{ '--pos': pos }}
    >
      <div className="beat-scrim" aria-hidden="true" />
      <div className="beat-inner">
        <span className="beat-kicker">{beat.kicker}</span>
        <h2 className="beat-title">{beat.title}</h2>
        <p className="beat-body">{beat.body}</p>
      </div>
    </article>
  );
}
