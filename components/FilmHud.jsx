'use client';

import { useFilm } from './FilmProvider';
import { SEGMENTS } from '../lib/film';

export default function FilmHud() {
  const { timecode, activeSeg } = useFilm();

  const currentSegment = SEGMENTS.find((s) => s.id === activeSeg) || SEGMENTS[0];

  return (
    <div className="film-hud" aria-hidden="true">
      {/* Top Left: Project & Location */}
      <div className="hud-corner top-left">
        <span className="hud-label">GWD Tours</span>
        <span className="hud-val">Edinburgh, Scotland</span>
      </div>

      {/* Top Right: Geographic Coordinates */}
      <div className="hud-corner top-right">
        <span className="hud-label">Position</span>
        <span className="hud-val">55.9533° N · 3.1883° W</span>
      </div>

      {/* Bottom Left: Live Film Timecode */}
      <div className="hud-corner bottom-left">
        <span className="hud-label">Timecode</span>
        <span className="hud-val font-mono">{timecode}</span>
      </div>

      {/* Bottom Right: Active Act & Elevation */}
      <div className="hud-corner bottom-right">
        <span className="hud-label">Act {currentSegment.num}</span>
        <span className="hud-val">{currentSegment.title}</span>
      </div>

      {/* Frame Corner Ticks */}
      <div className="hud-tick tick-tl" />
      <div className="hud-tick tick-tr" />
      <div className="hud-tick tick-bl" />
      <div className="hud-tick tick-br" />
    </div>
  );
}
