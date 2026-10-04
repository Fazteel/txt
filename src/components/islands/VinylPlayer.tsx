import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  currentTrack,
  isPlaying,
  isVinylSpinning,
  audioCurrentTime,
  audioDuration,
  playTrack,
  toggleAudio,
  type PlayingTrack
} from '../../stores/audioStore';
import discographyData from '../../data/discography.json';
import { Play, Pause, Disc3, Music2, ExternalLink, Volume2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export default function VinylPlayer() {
  const activeTrack = useStore(currentTrack);
  const playing = useStore(isPlaying);
  const spinning = useStore(isVinylSpinning);
  const currentTime = useStore(audioCurrentTime);
  const duration = useStore(audioDuration);

  const [selectedAlbumIndex, setSelectedAlbumIndex] = useState(0);
  const [snippetDuration, setSnippetDuration] = useState(4);

  const albumTabsRef = useRef<HTMLDivElement>(null);
  const tracklistRef = useRef<HTMLDivElement>(null);

  const currentAlbum = discographyData[selectedAlbumIndex] || discographyData[0];
  const displayedTrack = (activeTrack && activeTrack.albumId === currentAlbum.id) ? activeTrack : currentAlbum.tracks[0];

  useEffect(() => {
    if (!activeTrack && currentAlbum.tracks.length > 0) {
      const firstT = currentAlbum.tracks[0];
      const trackObj: PlayingTrack = {
        albumId: currentAlbum.id,
        albumTitle: currentAlbum.title,
        coverImage: currentAlbum.coverImage,
        themeColor: currentAlbum.themeColor,
        trackNo: firstT.trackNo,
        title: firstT.title,
        startAtSecond: firstT.startAtSecond,
        previewAudioUrl: firstT.previewAudioUrl,
        externalLinks: firstT.externalLinks,
      };
      currentTrack.set(trackObj);
    }
  }, []);

  useEffect(() => {
    const el = albumTabsRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const canScrollLeft = el.scrollLeft > 0 && delta < 0;
      const canScrollRight = el.scrollLeft < maxScroll - 1 && delta > 0;

      if (canScrollLeft || canScrollRight) {
        e.preventDefault();
        el.scrollLeft += delta;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const el = tracklistRef.current;
    if (!el) return;

    el.scrollTop = 0;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;

      const canScrollUp = el.scrollTop > 0 && e.deltaY < 0;
      const canScrollDown = el.scrollTop < maxScroll - 1 && e.deltaY > 0;

      if (canScrollUp || canScrollDown) {
        e.preventDefault();
        el.scrollTop += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [selectedAlbumIndex]);

  const scrollAlbums = (direction: 'left' | 'right') => {
    if (albumTabsRef.current) {
      albumTabsRef.current.scrollBy({
        left: direction === 'left' ? -240 : 240,
        behavior: 'smooth',
      });
    }
  };

  const handleTrackSelect = (track: any) => {
    const trackObj: PlayingTrack = {
      albumId: currentAlbum.id,
      albumTitle: currentAlbum.title,
      coverImage: currentAlbum.coverImage,
      themeColor: currentAlbum.themeColor,
      trackNo: track.trackNo,
      title: track.title,
      startAtSecond: track.startAtSecond,
      previewAudioUrl: track.previewAudioUrl,
      fallbackItunesUrl: track.fallbackItunesUrl,
      externalLinks: track.externalLinks,
    };
    playTrack(trackObj, snippetDuration);
  };

  const handleAlbumSelect = (idx: number, e?: React.MouseEvent) => {
    setSelectedAlbumIndex(idx);
    if (albumTabsRef.current && e?.currentTarget) {
      const container = albumTabsRef.current;
      const target = e.currentTarget as HTMLElement;
      const scrollLeft = target.offsetLeft - container.offsetWidth / 2 + target.offsetWidth / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
    const newAlbum = discographyData[idx];
    if (newAlbum && newAlbum.tracks.length > 0) {
      const firstT = newAlbum.tracks[0];
      const trackObj: PlayingTrack = {
        albumId: newAlbum.id,
        albumTitle: newAlbum.title,
        coverImage: newAlbum.coverImage,
        themeColor: newAlbum.themeColor,
        trackNo: firstT.trackNo,
        title: firstT.title,
        startAtSecond: firstT.startAtSecond,
        previewAudioUrl: firstT.previewAudioUrl,
        externalLinks: firstT.externalLinks,
      };
      if (playing) {
        playTrack(trackObj, snippetDuration);
      } else {
        currentTrack.set(trackObj);
      }
    }
  };

  const handleVinylClick = () => {
    if (activeTrack && activeTrack.albumId === currentAlbum.id) {
      toggleAudio();
    } else if (currentAlbum.tracks.length > 0) {
      handleTrackSelect(currentAlbum.tracks[0]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-gradient-to-b from-[#141417]/80 to-[#0c0c0e]/90 border border-white/10 rounded-2xl p-4 sm:p-8 lg:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[130px] opacity-25 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: currentAlbum.themeColor || '#F8138D' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[130px] opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: '#F8138D' }}
      />

      <div className="relative mb-6 sm:mb-12 group/albums">
        <button
          type="button"
          onClick={() => scrollAlbums('left')}
          aria-label="Scroll left to view previous albums"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:border-[#F8138D] hover:text-[#F8138D] transition-all opacity-0 group-hover/albums:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={albumTabsRef}
          data-lenis-prevent
          className="flex items-center overflow-x-auto whitespace-nowrap gap-2 sm:gap-3 border-b border-white/10 pb-3 scrollbar-none overscroll-contain select-none -mx-1 px-1 sm:mx-0 sm:px-3 scroll-smooth"
        >
          {discographyData.map((album, idx) => {
            const isSelected = selectedAlbumIndex === idx;
            return (
              <button
                key={album.id}
                onClick={(e) => handleAlbumSelect(idx, e)}
                className={`shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-[1.02]'
                    : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: album.themeColor }}
                />
                {album.title.split(':')[0]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollAlbums('right')}
          aria-label="Scroll right to view next albums"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:border-[#F8138D] hover:text-[#F8138D] transition-all opacity-0 group-hover/albums:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center select-none">
            <div
              onClick={handleVinylClick}
              className={`absolute top-0 right-0 w-52 h-52 sm:w-68 sm:h-68 md:w-76 md:h-76 rounded-full transition-transform duration-700 ease-out cursor-pointer z-10 ${
                playing && activeTrack?.albumId === currentAlbum.id
                  ? 'translate-x-10 sm:translate-x-16 md:translate-x-24 shadow-2xl'
                  : 'translate-x-6 sm:translate-x-10 md:translate-x-16 shadow-xl hover:translate-x-8 sm:hover:translate-x-14'
              }`}
            >
              <div
                className={`w-full h-full rounded-full relative flex items-center justify-center ${
                  spinning ? 'animate-spin-vinyl' : ''
                }`}
                style={{
                  background: 'radial-gradient(circle, #25252b 0%, #121215 50%, #08080a 100%)',
                  boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 0 15px rgba(255,255,255,0.05)',
                }}
              >
                <img
                  src="/images/vinyl-master.png"
                  alt="Vinyl grooves"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
                />

                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 border-white/20 p-1 flex flex-col items-center justify-center text-center shadow-inner relative z-20"
                  style={{
                    backgroundColor: currentAlbum.themeColor || '#1f1f23',
                  }}
                >
                  <span className="text-[9px] font-black tracking-widest text-black/80 uppercase">
                    + × +
                  </span>
                  <span className="text-[8px] font-bold text-black uppercase max-w-[80px] truncate leading-tight mt-0.5">
                    {displayedTrack?.title}
                  </span>
                  <span className="text-[7px] text-black/70 tracking-wider">33 RPM</span>
                  <div className="w-3.5 h-3.5 rounded-full bg-black/90 border border-black/40 mt-1" />
                </div>
              </div>
            </div>

            <div
              onClick={handleVinylClick}
              className="relative z-20 w-52 h-52 sm:w-68 sm:h-68 md:w-76 md:h-76 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/20 cursor-pointer group"
            >
              <img
                src={currentAlbum.coverImage}
                alt={currentAlbum.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs">
                <div className="w-14 h-14 rounded-full bg-[#F8138D] text-white flex items-center justify-center shadow-[0_0_20px_rgba(248,19,141,0.6)]">
                  {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </div>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-white/90 truncate drop-shadow">
                  {currentAlbum.title}
                </span>
                <span className="px-2 py-0.5 bg-black/60 rounded text-[10px] text-[#F8138D] font-mono border border-white/10">
                  {currentAlbum.releaseDate}
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#F8138D] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentAlbum.type}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {currentAlbum.title}
            </h3>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Tracklist ({currentAlbum.tracks.length})</span>
              {currentAlbum.tracks.length > 5 && (
                <span className="text-[10px] font-mono text-[#F8138D] font-normal normal-case tracking-normal">
                  Scroll for more ↓
                </span>
              )}
            </div>

            <div
              ref={tracklistRef}
              data-lenis-prevent
              className="space-y-2 max-h-[290px] overflow-y-auto pr-1.5 overscroll-contain scroll-smooth"
            >
              {currentAlbum.tracks.map((track) => {
                const isCurrent = activeTrack?.albumId === currentAlbum.id && activeTrack?.title === track.title;
                return (
                  <div
                    key={track.trackNo}
                    onClick={() => handleTrackSelect(track)}
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isCurrent
                        ? 'bg-neutral-800/80 border-[#F8138D]/50 shadow-[0_0_15px_rgba(248,19,141,0.25)] text-white'
                        : 'bg-neutral-900/40 border-white/5 text-neutral-300 hover:bg-neutral-800/50 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-neutral-500 w-5">
                        {String(track.trackNo).padStart(2, '0')}
                      </span>
                      <button
                        className={`p-1.5 rounded-full transition-colors ${
                          isCurrent && playing
                            ? 'bg-[#F8138D] text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {isCurrent && playing ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                        )}
                      </button>
                      <span className="text-sm font-medium">{track.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
