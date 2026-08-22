'use client';

import { ScrollProvider } from '../lib/scroll';
import { FilmProvider } from '../components/FilmProvider';
import FilmStage from '../components/FilmStage';
import FilmHud from '../components/FilmHud';
import ChapterRail from '../components/ChapterRail';
import Preloader from '../components/Preloader';
import Beat from '../components/Beat';
import Strand from '../components/Strand';
import AtmosphereLab from '../components/AtmosphereLab';
import Hotspots from '../components/Hotspots';
import Marquee from '../components/Marquee';
import Cursor from '../components/Cursor';
import Reveal from '../components/Reveal';
import Credit from '../components/Credit';
import { SEGMENTS, VERNACULAR_CARDS, NUMBERS, MARQUEE, beatsFor } from '../lib/film';

function FilmTrack({ seg }) {
  return (
    <section className="track" data-segment={seg.id} style={{ height: `${seg.vh}vh` }}>
      {beatsFor(seg).map((b) => (
        <Beat key={b.t} beat={b} />
      ))}
    </section>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <a className="topbar__mark" href="#top" data-cursor="Top">
        <svg viewBox="0 0 34 24" aria-hidden="true">
          <path d="M4 6 H30" />
          <path d="M4 12 H22" />
          <path d="M4 18 H28" />
          <circle cx="28" cy="12" r="2.5" />
        </svg>
        <span>GWD Tours</span>
      </a>
      <nav className="topbar__nav">
        <a href="#atlas">Atlas</a>
        <a href="#observatory">Atmosphere</a>
        <a href="#panorama">Panorama</a>
        <a href="#figures">Figures</a>
      </nav>
      <span className="topbar__meta font-mono">5 Acts · 136s</span>
    </header>
  );
}

function NumbersSection() {
  return (
    <section className="nums" id="figures">
      <Reveal as="span" className="kicker">Historic Registry</Reveal>
      <Reveal as="h2" className="h2" delay={70}>
        Centuries of stone,<br />
        <em>volcano, and crown.</em>
      </Reveal>
      <div className="nums__grid">
        {NUMBERS.map((n, i) => (
          <Reveal className="num" key={n.v} delay={120 + i * 70}>
            <span className="num__v font-mono">{n.v}</span>
            <span className="num__k">{n.k}</span>
            <p className="num__b">{n.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="closing">
      <Reveal as="span" className="kicker">The Sovereign Capital</Reveal>
      <Reveal as="h2" className="closing__h" delay={70}>
        Preserved in ashlar,<br />
        <em>illuminated by gaslight.</em>
      </Reveal>
      <Reveal as="p" className="closing__p" delay={150}>
        From the basalt fortress commanding the volcanic crags to the rational neoclassical grids
        of the Enlightenment New Town, Edinburgh’s dual heritage remains one of the world’s most intact architectural monuments.
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <Marquee text={MARQUEE} dir={-1} speed={0.12} tone="foot" />
      <div className="foot__grid">
        <div>
          <p className="foot__k">The Walkthrough</p>
          <p className="foot__v">
            One hundred and thirty-six seconds of cinematic footage, transcoded with intra-frame keyframes
            for instantaneous, stutter-free scroll seeking forwards and in reverse.
          </p>
        </div>
        <div>
          <p className="foot__k">The Heritage</p>
          <p className="foot__v">
            Designated a UNESCO World Heritage site in 1995, encompassing over 4,500 historic buildings
            spanning medieval wynds and Georgian terraces.
          </p>
        </div>
        <div>
          <p className="foot__k">Architecture & Engine</p>
          <p className="foot__v">
            Built with Next.js 15, Vanilla CSS, and Lenis. Video is decoded via high-throughput memory streams
            with a 2.5 FPS still-frame fallback ladder.
          </p>
        </div>
      </div>
      <p className="foot__fine">
        A demonstration piece for GWD Tours. The source footage was captured in Edinburgh, Scotland.
      </p>
      <Credit />
    </footer>
  );
}

export default function Page() {
  return (
    <ScrollProvider>
      <FilmProvider>
        <Cursor />
        <div className="grain" aria-hidden="true" />
        <Preloader />
        <FilmStage />
        <FilmHud />
        <ChapterRail />
        <TopBar />

        <main id="top">
          {/* Act I: The Old Town & Wynds */}
          <FilmTrack seg={SEGMENTS[0]} />

          {/* Interlude 1: Tenement & Wynd Atlas */}
          <Strand
            id="atlas"
            kicker="Interlude · Architecture of the Ridge"
            title="The Tenement & Wynd Atlas"
            note="Four centuries of vertical living along the volcanic spine."
            cards={VERNACULAR_CARDS}
          />

          {/* Act II: The Romantic Monuments */}
          <FilmTrack seg={SEGMENTS[1]} />

          {/* Interlude 2: The Atmospheric Observatory */}
          <AtmosphereLab />

          {/* Act III: The Skyline & Citadel */}
          <FilmTrack seg={SEGMENTS[2]} />

          {/* Interlude 3: Panoramic Survey Hotspots */}
          <Hotspots />

          {/* Act IV: The Royal Closes & Fortress */}
          <FilmTrack seg={SEGMENTS[3]} />

          {/* Act V: The Enlightenment Capital */}
          <FilmTrack seg={SEGMENTS[4]} />

          {/* Outro: Numbers, Narrative & Footer */}
          <NumbersSection />
          <ClosingSection />
          <Footer />
        </main>
      </FilmProvider>
    </ScrollProvider>
  );
}
