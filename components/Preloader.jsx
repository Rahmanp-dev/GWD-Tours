'use client';

import { useState, useEffect } from 'react';
import { useFilm } from './FilmProvider';

export default function Preloader() {
  const { ready, setReady } = useFilm();
  const [pct, setPct] = useState(0);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(28000000);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function streamVideo() {
      const isMobile = window.matchMedia('(max-width: 820px)').matches;
      const url = isMobile
        ? '/video/edinburgh-scrub-mobile.mp4'
        : '/video/edinburgh-scrub.mp4';

      try {
        const response = await fetch(url);
        const cl = response.headers.get('content-length');
        const total = parseInt(cl, 10) || (isMobile ? 11000000 : 28000000);
        setTotalBytes(total);

        const reader = response.body?.getReader();
        if (!reader) {
          setPct(100);
          setComplete(true);
          return;
        }

        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (isCancelled) return;

          received += value.length;
          setLoadedBytes(received);
          const currentPct = Math.min(100, Math.round((received / total) * 100));
          setPct(currentPct);
        }

        if (isCancelled) return;
        setComplete(true);
      } catch {
        if (!isCancelled) {
          setPct(100);
          setComplete(true);
        }
      }
    }

    streamVideo();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleBegin = () => {
    // Prime the video decoder on user gesture
    const video = document.querySelector('video.stage-video');
    if (video) {
      video.play().then(() => video.pause()).catch(() => {});
    }
    setReady(true);
  };

  if (ready) return null;

  const mbLoaded = (loadedBytes / 1048576).toFixed(1);
  const mbTotal = (totalBytes / 1048576).toFixed(1);

  return (
    <div className="preloader-overlay" aria-live="polite">
      <div className="preloader-card">
        <span className="preloader-kicker">GWD Tours · Scotland</span>
        <h1 className="preloader-title">Edinburgh</h1>
        <p className="preloader-sub">The Athens of the North</p>

        <div className="preloader-bar-wrap">
          <div className="preloader-bar" style={{ width: `${pct}%` }} />
        </div>

        <div className="preloader-meta">
          <span className="preloader-pct">{pct}%</span>
          <span className="preloader-bytes">{mbLoaded} / {mbTotal} MB</span>
        </div>

        {complete ? (
          <button
            type="button"
            className="preloader-btn"
            data-begin
            onClick={handleBegin}
          >
            Enter Walkthrough
          </button>
        ) : (
          <div className="preloader-status">Streaming high-definition masters...</div>
        )}
      </div>
    </div>
  );
}
