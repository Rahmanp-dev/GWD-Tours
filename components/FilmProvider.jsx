'use client';

import { createContext, useContext, useState, useRef } from 'react';
import { SEGMENTS } from '../lib/film';

const FilmContext = createContext(null);

export function FilmProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [activeSeg, setActiveSeg] = useState(SEGMENTS[0].id);
  const [timecode, setTimecode] = useState('00:00:00');
  const [haarDensity, setHaarDensity] = useState(0.4);
  const [lanternWarmth, setLanternWarmth] = useState(0.7);

  const sharedTimeRef = useRef(0);

  return (
    <FilmContext.Provider
      value={{
        ready,
        setReady,
        activeSeg,
        setActiveSeg,
        timecode,
        setTimecode,
        haarDensity,
        setHaarDensity,
        lanternWarmth,
        setLanternWarmth,
        sharedTimeRef,
      }}
    >
      {children}
    </FilmContext.Provider>
  );
}

export function useFilm() {
  return useContext(FilmContext);
}
