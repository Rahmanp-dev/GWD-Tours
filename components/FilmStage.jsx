'use client';

import { useEffect, useRef } from 'react';
import { useScrollSub } from '../lib/scroll';
import { useFilm } from './FilmProvider';
import { SEGMENTS, FILM_DURATION, TOTAL_LADDER_FRAMES } from '../lib/film';

const LERP_FACTOR = 0.085;
const EPS = 0.0009;

export default function FilmStage() {
  const { ready, setTimecode, setActiveSeg, haarDensity, lanternWarmth, sharedTimeRef } = useFilm();

  const videoRef = useRef(null);
  const stillRef = useRef(null);
  const stageRef = useRef(null);

  const stateRef = useRef({
    busy: false,
    applied: 0,
    targetTime: 0,
    currentTime: 0,
    pending: null,
    timer: null,
    misses: 0,
    mode: 'blob', // 'blob' | 'direct' | 'stills'
    stillIndex: 0,
    segmentOffsets: [],
    totalScrollDistance: 0,
  });

  // Calculate segment layout boundaries
  useEffect(() => {
    let accY = 0;
    const offsets = SEGMENTS.map((seg) => {
      const vhPx = (seg.vh / 100) * window.innerHeight;
      const startY = accY;
      const endY = accY + vhPx;
      accY = endY + window.innerHeight * 0.8; // Gap for interlude
      return { ...seg, startY, endY, vhPx };
    });

    stateRef.current.segmentOffsets = offsets;
    stateRef.current.totalScrollDistance = accY;
  }, []);

  // Update layout on window resize
  useEffect(() => {
    const handleResize = () => {
      let accY = 0;
      const offsets = SEGMENTS.map((seg) => {
        const vhPx = (seg.vh / 100) * window.innerHeight;
        const startY = accY;
        const endY = accY + vhPx;
        accY = endY + window.innerHeight * 0.8;
        return { ...seg, startY, endY, vhPx };
      });
      stateRef.current.segmentOffsets = offsets;
      stateRef.current.totalScrollDistance = accY;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial setup & hardware properties
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;

    // Load source with Rung 1 / Rung 2
    const isMobile = window.matchMedia('(max-width: 820px)').matches;
    const videoSrc = isMobile
      ? '/video/edinburgh-scrub-mobile.mp4'
      : '/video/edinburgh-scrub.mp4';

    let objectUrl = null;
    let isCancelled = false;

    async function initSource() {
      try {
        const res = await fetch(videoSrc);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (isCancelled) return;
        objectUrl = URL.createObjectURL(blob);
        v.src = objectUrl;
        stateRef.current.mode = 'blob';
      } catch {
        if (isCancelled) return;
        v.src = videoSrc;
        stateRef.current.mode = 'direct';
      }
      v.load();
    }

    initSource();

    const handleLoadedMetadata = async () => {
      v.currentTime = 0.001;
      try {
        await v.play();
        v.pause();
      } catch {
        // Low Power Mode or gesture pending; proceed safely
      }
    };

    v.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      isCancelled = true;
      v.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  // Seek engine with watchdog & fallback ladder escalation
  useEffect(() => {
    const s = stateRef.current;
    const v = videoRef.current;
    if (!v) return;

    const engageStillMode = () => {
      if (s.mode === 'stills') return;
      s.mode = 'stills';
      if (stageRef.current) stageRef.current.dataset.mode = 'stills';
    };

    const settle = () => {
      clearTimeout(s.timer);
      s.busy = false;
      s.misses = 0;
      if (s.pending != null) {
        const nextT = s.pending;
        s.pending = null;
        apply(nextT);
      }
    };

    const onStuck = (t) => {
      s.busy = false;
      s.misses = (s.misses || 0) + 1;
      if (s.misses === 1) {
        apply(t + EPS);
        return;
      }
      if (s.misses === 2) {
        v.load();
        apply(t);
        return;
      }
      if (s.misses === 3 && s.mode === 'blob') {
        const isMobile = window.matchMedia('(max-width: 820px)').matches;
        v.src = isMobile ? '/video/edinburgh-scrub-mobile.mp4' : '/video/edinburgh-scrub.mp4';
        v.load();
        s.mode = 'direct';
        apply(t);
        return;
      }
      engageStillMode();
    };

    const apply = (t) => {
      if (s.mode === 'stills') {
        paintStill(t);
        return;
      }
      if (!v || v.readyState < 1) {
        s.pending = t;
        return;
      }
      if (v.seeking || s.busy) {
        s.pending = t;
        return;
      }

      s.busy = true;
      s.applied = t;
      clearTimeout(s.timer);
      s.timer = setTimeout(() => onStuck(t), 340);
      v.currentTime = t;
    };

    const paintStill = (t) => {
      const idx = Math.min(TOTAL_LADDER_FRAMES, Math.max(1, Math.round(t * 2.5) + 1));
      if (idx === s.stillIndex) return;
      s.stillIndex = idx;
      if (stillRef.current) {
        stillRef.current.src = `/stills/ladder/f${String(idx).padStart(4, '0')}.webp`;
      }
    };

    v.addEventListener('seeked', settle);
    v.addEventListener('error', () => onStuck(s.applied || 0));
    v.addEventListener('stalled', () => onStuck(s.applied || 0));

    // Recovery on visibility and page restore
    const handleVisibility = () => {
      if (!document.hidden && v) apply(s.applied + EPS);
    };
    const handlePageShow = (e) => {
      if (e.persisted && v) {
        v.load();
        apply(s.applied || 0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pageshow', handlePageShow);

    // Continuous LERP Loop
    let rafId;
    const lerpLoop = () => {
      const delta = s.targetTime - s.currentTime;
      if (Math.abs(delta) > 0.001) {
        s.currentTime += delta * LERP_FACTOR;
        sharedTimeRef.current = s.currentTime;

        // Apply seek if delta from hardware video currentTime is noticeable
        if (Math.abs((v.currentTime || 0) - s.currentTime) > 0.015) {
          apply(s.currentTime);
        }

        // Format timecode (00:00:SS:FF)
        const totalSec = Math.max(0, s.currentTime);
        const mins = Math.floor(totalSec / 60);
        const secs = Math.floor(totalSec % 60);
        const frames = Math.floor((totalSec % 1) * 25);
        const tcStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
        setTimecode(tcStr);
      }

      rafId = requestAnimationFrame(lerpLoop);
    };

    rafId = requestAnimationFrame(lerpLoop);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(s.timer);
      v.removeEventListener('seeked', settle);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [setTimecode, sharedTimeRef]);

  // Scroll Subscriber: map scroll position to film time and active segment
  useScrollSub(({ y }) => {
    const s = stateRef.current;
    const offsets = s.segmentOffsets;
    if (!offsets.length) return;

    let targetT = 0;
    let currentSegId = offsets[0].id;
    let focus = 1.0;

    for (let i = 0; i < offsets.length; i++) {
      const seg = offsets[i];
      if (y < seg.startY) {
        if (i === 0) {
          targetT = seg.from;
          currentSegId = seg.id;
          focus = 1.0;
        }
        break;
      } else if (y >= seg.startY && y <= seg.endY) {
        const segProgress = (y - seg.startY) / seg.vhPx;
        targetT = seg.from + segProgress * (seg.to - seg.from);
        currentSegId = seg.id;
        focus = 1.0;
        break;
      } else {
        // Gap between segments: hold last frame and dim slightly
        const nextSeg = offsets[i + 1];
        if (nextSeg && y < nextSeg.startY) {
          targetT = seg.to;
          currentSegId = seg.id;
          const gapProgress = (y - seg.endY) / (nextSeg.startY - seg.endY);
          focus = Math.cos(gapProgress * Math.PI * 2) * 0.25 + 0.75; // subtle dip
          break;
        } else if (!nextSeg) {
          targetT = seg.to;
          currentSegId = seg.id;
          focus = 1.0;
        }
      }
    }

    s.targetTime = Math.min(FILM_DURATION, Math.max(0, targetT));
    setActiveSeg(currentSegId);

    // Apply optical depth to stage
    if (stageRef.current) {
      stageRef.current.style.filter = `brightness(${focus}) contrast(1.02)`;
    }
  });

  return (
    <div
      ref={stageRef}
      className="stage-container"
      style={{
        '--haar-density': haarDensity,
        '--lantern-warmth': lanternWarmth,
      }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        poster="/stills/poster.jpg"
        className="stage-video"
      />
      <img
        ref={stillRef}
        className="stage-still"
        alt="Edinburgh architectural still"
        aria-hidden="true"
        decoding="async"
        src="/stills/poster.jpg"
      />
      <div className="stage-scrim" aria-hidden="true" />
      <div className="stage-fog-overlay" aria-hidden="true" />
    </div>
  );
}
