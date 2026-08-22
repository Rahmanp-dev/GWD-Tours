'use client';

import { useFilm } from './FilmProvider';

export default function AtmosphereLab() {
  const { haarDensity, setHaarDensity, lanternWarmth, setLanternWarmth } = useFilm();

  return (
    <section className="atmosphere-section" id="observatory">
      <div className="atmosphere-container">
        <div className="atmosphere-info">
          <span className="atmosphere-kicker">Interactive Control · Calton Hill</span>
          <h2 className="atmosphere-title">The Atmospheric Observatory</h2>
          <p className="atmosphere-desc">
            Edinburgh’s character is defined by the coastal <em>haar</em>, a cold sea fog rolling in
            from the Firth of Forth that catches on the basalt ridge and transforms the city into a silhouette of stone and gaslight.
          </p>
        </div>

        <div className="atmosphere-controls">
          <div className="control-group">
            <div className="control-header">
              <label htmlFor="haar-range" className="control-label">North Sea Haar Density</label>
              <span className="control-val font-mono">{Math.round(haarDensity * 100)}%</span>
            </div>
            <input
              id="haar-range"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={haarDensity}
              onChange={(e) => setHaarDensity(parseFloat(e.target.value))}
              className="control-slider"
            />
            <div className="control-ticks">
              <span>Crisp Sky</span>
              <span>Morning Veil</span>
              <span>Dense Haar</span>
            </div>
          </div>

          <div className="control-group">
            <div className="control-header">
              <label htmlFor="lantern-range" className="control-label">Gaslight & Malt Glow</label>
              <span className="control-val font-mono">{Math.round(lanternWarmth * 100)}%</span>
            </div>
            <input
              id="lantern-range"
              type="range"
              min="0.2"
              max="1"
              step="0.01"
              value={lanternWarmth}
              onChange={(e) => setLanternWarmth(parseFloat(e.target.value))}
              className="control-slider"
            />
            <div className="control-ticks">
              <span>Grey Basalt</span>
              <span>Dusk Amber</span>
              <span>Golden Tavern</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
