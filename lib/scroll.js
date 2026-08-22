'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';

const ScrollContext = createContext(null);

export function ScrollProvider({ children }) {
  const engineRef = useRef({
    lenis: null,
    y: 0,
    progress: 0,
    velocity: 0,
    subs: new Set(),
  });

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.8,
    });

    engineRef.current.lenis = lenis;
    window.__lenis = lenis;

    let rafId;
    const loop = (time) => {
      lenis.raf(time);
      const state = engineRef.current;
      state.y = lenis.scroll;
      state.progress = lenis.progress;
      state.velocity = lenis.velocity;

      for (const fn of state.subs) {
        fn(state);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <ScrollContext.Provider value={engineRef}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollSub(cb) {
  const engine = useContext(ScrollContext);
  const held = useRef(cb);
  held.current = cb;

  useEffect(() => {
    if (!engine || !engine.current) return;
    const fn = (s) => held.current(s);
    engine.current.subs.add(fn);
    return () => engine.current.subs.delete(fn);
  }, [engine]);
}

export function useLenis() {
  const engine = useContext(ScrollContext);
  return engine?.current?.lenis || null;
}
