'use client';

import { useFilm } from './FilmProvider';
import { useLenis } from '../lib/scroll';
import { SEGMENTS } from '../lib/film';

export default function ChapterRail() {
  const { activeSeg } = useFilm();
  const lenis = useLenis();

  const handleJump = (segId) => {
    if (!lenis) return;
    const targetEl = document.querySelector(`[data-segment="${segId}"]`);
    if (targetEl) {
      lenis.scrollTo(targetEl, { offset: 0, duration: 1.4 });
    }
  };

  return (
    <nav className="chapter-rail" aria-label="Tour Chapters">
      <div className="rail-line" aria-hidden="true" />
      {SEGMENTS.map((seg) => {
        const isActive = activeSeg === seg.id;
        return (
          <button
            key={seg.id}
            type="button"
            className={`rail-item ${isActive ? 'active' : ''}`}
            onClick={() => handleJump(seg.id)}
            data-cursor={`Act ${seg.num}`}
          >
            <span className="rail-num font-mono">{seg.num}</span>
            <span className="rail-label">{seg.title}</span>
            <span className="rail-indicator" />
          </button>
        );
      })}
    </nav>
  );
}
