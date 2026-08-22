# GWD-Tours · Edinburgh Immersive Experience

A scroll-driven cinematic walkthrough tour of **Edinburgh, Scotland**, developed for **GWD Tours** around a 136.8-second master film. The picture is a native `<video>` element seeked frame-by-frame against scroll position, cut into five tour acts with horizontal interludes, interactive atmospheric controls, and panoramic survey hotspots.

Developed by **GWD Global**, strictly following the `rp-3d-immersive` skill and GWD house design system.

---

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Or build for production
npm run build
npm start
```

Serves on port `3250` by default.

---

## Experience Structure

| Act | Subject | Film Time | Role in Experience |
| :--- | :--- | :--- | :--- |
| **Act I** | **The Old Town & Wynds** | `0.0s – 33.6s` | St Giles' Crown Spire, Royal Mile, Cowgate Arch, Enlightenment monuments. |
| **Interlude 1** | *The Tenement & Wynd Atlas* | — | Pinned horizontal card rail with internal card parallax drift. |
| **Act II** | **The Romantic Monuments** | `33.6s – 57.2s` | Scott Monument, Calton Hill National Monument, Dugald Stewart temple. |
| **Interlude 2** | *The Atmospheric Observatory* | — | Live interactive slider controller for North Sea *haar* and gaslight amber warmth. |
| **Act III** | **The Skyline & Citadel** | `57.2s – 88.2s` | The Mound / New College spires, Calton Hill panorama, Balmoral clock. |
| **Interlude 3** | *Panoramic Survey Hotspots* | — | High-resolution Calton Hill vista plate with interactive landmark pins. |
| **Act IV** | **The Royal Closes & Fortress** | `88.2s – 119.3s` | The Vennel steps, Victoria Street curve, Grassmarket, Greyfriars Kirkyard. |
| **Act V** | **The Enlightenment Capital** | `119.3s – 136.8s` | Descent to Princes Street, Duke of Wellington equestrian bronze at Register House. |

---

## Technical Architecture

- **Framework:** Next.js 15 (App Router) + Pure Vanilla CSS + Lenis.
- **Scroll Engine:** Single shared `requestAnimationFrame` loop with direct DOM ref writes and zero React re-renders on scroll.
- **Video Fallback Ladder:**
  1. *Rung 1:* Memory-streamed Blob with byte-accurate progress (`0–100%`).
  2. *Rung 2:* Direct range-request playback if Blob fetch is blocked.
  3. *Rung 3:* Decoder watchdog latch & hardware reload.
  4. *Rung 4:* 2.5 FPS WebP still-frame ladder (`public/stills/ladder/`) ensuring the page never freezes.
- **House Design System:**
  - `Basalt Slate` (`#0B0E11` ground)
  - `Weathered Sandstone` (`#EDE8DF` ink)
  - `Amber Malt & Gaslight` (`#D49D42` accent, strictly < 5% budget)
  - Typography: `Cinzel` (neoclassical serif display) paired with `Plus Jakarta Sans` (UI / body).
  - Fibonacci spacing scale (`--s-1` to `--s-9`), two duration bands (`220ms` / `900ms`).

---

## Attribution

Developed by **GWD Global** for **GWD Tours**.
