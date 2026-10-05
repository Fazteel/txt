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
  type PlayingTrack,
} from '../../stores/audioStore';
import discographyData from '../../data/discography.json';
import VinylRecord from '../ui/VinylRecord';
import StreamingLinks from '../ui/StreamingLinks';
import {
  Play,
  Pause,
  Disc3,
  Music2,
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react';

export default function VinylPlayer() {
  const activeTrack = useStore(currentTrack);
  const playing = useStore(isPlaying);
  const currentTime = useStore(audioCurrentTime);
  const duration = useStore(audioDuration);

  const [selectedAlbumIndex, setSelectedAlbumIndex] = useState(0);
  const [snippetDuration, setSnippetDuration] = useState(30);

  const albumTabsRef = useRef<HTMLDivElement>(null);

  const currentAlbum = discographyData[selectedAlbumIndex] || discographyData[0];
  const titleTrack = currentAlbum.titleTrack;
  const isCurrentPlaying = playing && activeTrack?.albumId === currentAlbum.id;

  useEffect(() => {
    if (!activeTrack && titleTrack) {
      const trackObj: PlayingTrack = {
        albumId: currentAlbum.id,
        albumTitle: currentAlbum.albumTitle,
        coverImage: currentAlbum.coverImage,
        themeColor: currentAlbum.themeColor,
        title: titleTrack.title,
        startAtSecond: titleTrack.startAtSecond,
        previewAudioUrl: titleTrack.previewAudioUrl,
        externalLinks: titleTrack.links,
      };
      currentTrack.set(trackObj);
    }
  }, []);

  const handleTogglePlay = () => {
    if (activeTrack && activeTrack.albumId === currentAlbum.id) {
      toggleAudio();
    } else {
      const trackObj: PlayingTrack = {
        albumId: currentAlbum.id,
        albumTitle: currentAlbum.albumTitle,
        coverImage: currentAlbum.coverImage,
        themeColor: currentAlbum.themeColor,
        title: titleTrack.title,
        startAtSecond: titleTrack.startAtSecond,
        previewAudioUrl: titleTrack.previewAudioUrl,
        externalLinks: titleTrack.links,
      };
      playTrack(trackObj, snippetDuration);
    }
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
    if (newAlbum) {
      const trackObj: PlayingTrack = {
        albumId: newAlbum.id,
        albumTitle: newAlbum.albumTitle,
        coverImage: newAlbum.coverImage,
        themeColor: newAlbum.themeColor,
        title: newAlbum.titleTrack.title,
        startAtSecond: newAlbum.titleTrack.startAtSecond,
        previewAudioUrl: newAlbum.titleTrack.previewAudioUrl,
        externalLinks: newAlbum.titleTrack.links,
      };

      if (playing) {
        playTrack(trackObj, snippetDuration);
      } else {
        currentTrack.set(trackObj);
      }
    }
  };

  const scrollAlbums = (direction: 'left' | 'right') => {
    if (albumTabsRef.current) {
      albumTabsRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-gradient-to-b from-[#141418]/90 to-[#0a0a0d]/95 border border-white/10 rounded-3xl p-5 sm:p-8 lg:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      <div
        className="absolute -top-36 -left-36 w-[500px] h-[500px] rounded-full blur-[150px] opacity-25 pointer-events-none transition-all duration-1000 ease-out"
        style={{ backgroundColor: currentAlbum.themeColor || '#F8138D' }}
      />
      <div
        className="absolute -bottom-36 -right-36 w-[450px] h-[450px] rounded-full blur-[140px] opacity-15 pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: '#F8138D' }}
      />

      <div className="relative mb-8 sm:mb-12 group/albums">
        <button
          type="button"
          onClick={() => scrollAlbums('left')}
          aria-label="Previous albums"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:border-[#F8138D] hover:text-[#F8138D] transition-all opacity-0 group-hover/albums:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={albumTabsRef}
          data-lenis-prevent
          className="flex items-center overflow-x-auto whitespace-nowrap gap-2 sm:gap-3 border-b border-white/10 pb-4 scrollbar-none overscroll-contain select-none px-2 scroll-smooth"
        >
          {discographyData.map((album, idx) => {
            const isSelected = selectedAlbumIndex === idx;
            return (
              <button
                key={album.id}
                onClick={(e) => handleAlbumSelect(idx, e)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.35)] scale-[1.03]'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: album.themeColor }}
                />
                <span>{album.albumTitle.split(':')[0]}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollAlbums('right')}
          aria-label="Next albums"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:border-[#F8138D] hover:text-[#F8138D] transition-all opacity-0 group-hover/albums:opacity-100 shadow-xl cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-4">
          <VinylRecord
            coverImage={currentAlbum.coverImage}
            albumTitle={currentAlbum.albumTitle}
            themeColor={currentAlbum.themeColor}
            isPlaying={isCurrentPlaying}
            onTogglePlay={handleTogglePlay}
            size="md"
          />

          <p className="text-[11px] font-mono text-neutral-400 mt-6 text-center flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F8138D]" />
            <span>Hover cover to slide out vinyl sleeve • Click to play/pause</span>
          </p>
        </div>

        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2.5">
              <span
                className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-widest font-bold border"
                style={{
                  borderColor: `${currentAlbum.themeColor}60`,
                  color: currentAlbum.themeColor || '#F8138D',
                  backgroundColor: `${currentAlbum.themeColor}15`,
                }}
              >
                {currentAlbum.type}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Released {currentAlbum.releaseDate}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-display font-medium text-neutral-300 tracking-tight">
              {currentAlbum.albumTitle}
            </h3>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-[#F8138D] uppercase">
                <Disc3 className={`w-4 h-4 ${isCurrentPlaying ? 'animate-spin' : ''}`} />
                <span>Essential Title Track</span>
              </span>

              {isCurrentPlaying && (
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-[#F8138D] animate-pulse" />
                  <span className="w-1 h-5 bg-[#F8138D] animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-[#F8138D] animate-pulse delay-150" />
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white uppercase tracking-tight leading-tight">
              {titleTrack.title}
            </h2>

            <div className="pt-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block mb-2 font-semibold">
                Official Music & Video Streams
              </span>
              <StreamingLinks
                spotify={titleTrack.links.spotify}
                youtube={titleTrack.links.youtube}
                appleMusic={titleTrack.links.appleMusic}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                onClick={handleTogglePlay}
                aria-label={isCurrentPlaying ? 'Pause Title Track' : 'Play Title Track Preview'}
                className="w-12 h-12 rounded-full bg-[#F8138D] hover:bg-[#ff2098] text-white flex items-center justify-center shadow-[0_0_20px_rgba(248,19,141,0.5)] transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                {isCurrentPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                )}
              </button>

              <div>
                <p className="text-xs font-semibold text-white">
                  {isCurrentPlaying ? 'Streaming Official Preview' : 'Play Legal Audio Preview'}
                </p>
                <p className="text-[11px] text-neutral-400 font-mono">
                  30s Public Preview • {isCurrentPlaying ? `${Math.round(currentTime)}s` : 'Instant Stream'}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-white/5 p-1 rounded-lg border border-white/10">
              {[15, 30].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSnippetDuration(sec)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    snippetDuration === sec
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
