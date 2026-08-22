'use client';

import { useState } from 'react';
import { HOTSPOTS_DATA } from '../lib/film';

export default function Hotspots() {
  const [activeId, setActiveId] = useState(HOTSPOTS_DATA[0].id);

  const activeSpot = HOTSPOTS_DATA.find((h) => h.id === activeId) || HOTSPOTS_DATA[0];

  return (
    <section className="hotspots-section" id="panorama">
      <div className="hotspots-header">
        <span className="hotspots-kicker">Panoramic Survey · Calton Hill Vista</span>
        <h2 className="hotspots-title">Anatomy of the Skyline</h2>
        <p className="hotspots-sub">Select any marker across the basalt horizon to inspect key landmarks.</p>
      </div>

      <div className="hotspots-stage">
        <img
          src="/stills/19-calton-hill-panorama.jpg"
          alt="Calton Hill Panorama over Edinburgh skyline"
          className="hotspots-plate"
          loading="lazy"
          decoding="async"
        />
        <div className="hotspots-scrim" aria-hidden="true" />

        {HOTSPOTS_DATA.map((spot, i) => {
          const isSelected = activeId === spot.id;
          return (
            <div
              key={spot.id}
              className={`hotspot-marker ${isSelected ? 'selected' : ''}`}
              style={{
                top: spot.top,
                left: spot.left,
                animationDelay: `${i * 180}ms`,
              }}
              onClick={() => setActiveId(spot.id)}
              onMouseEnter={() => setActiveId(spot.id)}
            >
              <button
                type="button"
                className="hotspot-btn"
                aria-label={`Inspect ${spot.title}`}
                data-cursor="Inspect"
              >
                <span className="hotspot-core" />
                <span className="hotspot-ping" />
              </button>
            </div>
          );
        })}

        {/* Persistent detail drawer overlay */}
        <div className="hotspot-card-drawer">
          <div className="hotspot-card">
            <span className="hotspot-card-kicker">{activeSpot.kicker}</span>
            <h3 className="hotspot-card-title">{activeSpot.title}</h3>
            <p className="hotspot-card-desc">{activeSpot.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
