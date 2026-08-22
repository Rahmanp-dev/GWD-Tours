'use client';

import { useLayoutEffect, useRef } from 'react';
import { useScrollSub } from '../lib/scroll';

export default function Strand({ id, kicker, title, note, cards }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const measure = () => {
      const travel = track.scrollWidth - window.innerWidth;
      section.style.height = `${window.innerHeight + Math.max(0, travel)}px`;
    };

    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure);

    return () => window.removeEventListener('resize', measure);
  }, [cards]);

  useScrollSub(({ y }) => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const travel = track.scrollWidth - window.innerWidth;
    const totalDistance = section.offsetHeight - vh;

    if (totalDistance <= 0) return;

    // Progress 0 to 1 through the pinned section
    const progress = Math.min(1, Math.max(0, -rect.top / totalDistance));
    const railOffsetX = progress * travel;

    track.style.transform = `translate3d(${-railOffsetX.toFixed(1)}px, 0, 0)`;

    // Parallax & focus inside each card
    const vw = window.innerWidth;
    cardRefs.current.forEach((cardEl) => {
      if (!cardEl) return;
      const img = cardEl.querySelector('.strand-card-img');
      const cardCenter = cardEl.offsetLeft - railOffsetX + cardEl.offsetWidth / 2;
      const n = (cardCenter - vw / 2) / vw; // -1 left edge, +1 right edge

      if (img) {
        img.style.transform = `translate3d(${(n * -32).toFixed(1)}px, 0, 0) scale(1.12)`;
      }

      const rawOpacity = 0.35 + Math.min(1, Math.max(0, 1.35 - Math.abs(n) * 1.1)) * 0.65;
      cardEl.style.opacity = rawOpacity.toFixed(3);
    });
  });

  return (
    <section ref={sectionRef} className="strand-section" id={id}>
      <div className="strand-sticky">
        <header className="strand-header">
          <span className="strand-kicker">{kicker}</span>
          <h2 className="strand-title">{title}</h2>
          {note && <p className="strand-note">{note}</p>}
        </header>

        <div ref={trackRef} className="strand-track">
          {cards.map((card, i) => (
            <article
              key={card.id}
              ref={(el) => (cardRefs.current[i] = el)}
              className="strand-card"
            >
              <div className="strand-card-frame">
                <img
                  src={card.img}
                  alt={card.title}
                  className="strand-card-img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="strand-card-scrim" aria-hidden="true" />
              </div>
              <div className="strand-card-body">
                <span className="strand-card-kicker">{card.kicker}</span>
                <h3 className="strand-card-title">{card.title}</h3>
                <p className="strand-card-caption">{card.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
