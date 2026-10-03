import React, { useState, useEffect } from 'react';
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
import { Play, Pause, Disc3, Music2, ExternalLink, Volume2, Sparkles } from 'lucide-react';

export default function VinylPlayer() {
  const activeTrack = useStore(currentTrack);
  const playing = useStore(isPlaying);
  const spinning = useStore(isVinylSpinning);
  const currentTime = useStore(audioCurrentTime);
  const duration = useStore(audioDuration);

  // Active selected album
  const [selectedAlbumIndex, setSelectedAlbumIndex] = useState(0);
  const [snippetDuration, setSnippetDuration] = useState(4); // 4 seconds preview as requested in PRD

  const currentAlbum = discographyData[selectedAlbumIndex] || discographyData[0];
  const displayedTrack = (activeTrack && activeTrack.albumId === currentAlbum.id) ? activeTrack : currentAlbum.tracks[0];

  // Auto-select first track of first album on initial mount if none selected
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
        fallbackItunesUrl: firstT.fallbackItunesUrl,
        externalLinks: firstT.externalLinks,
      };
      // Set current track state without auto-playing (user must press play)
      currentTrack.set(trackObj);
    }
  }, []);

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

  const handleAlbumSelect = (idx: number) => {
    setSelectedAlbumIndex(idx);
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
        fallbackItunesUrl: firstT.fallbackItunesUrl,
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
    <div className="w-full max-w-6xl mx-auto bg-gradient-to-b from-[#141417]/80 to-[#0c0c0e]/90 border border-white/10 rounded-2xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Decorative ambient background glow matching album theme color */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[130px] opacity-25 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: currentAlbum.themeColor || '#00e5ff' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[130px] opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: '#00e5ff' }}
      />

      {/* Album Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 sm:mb-12 border-b border-white/10 pb-4">
        {discographyData.map((album, idx) => {
          const isSelected = selectedAlbumIndex === idx;
          return (
            <button
              key={album.id}
              onClick={() => handleAlbumSelect(idx)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer ${
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        {/* Turntable Vinyl Stage */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center select-none">
            {/* Vinyl Record that slides out and is always visible on all albums */}
            <div
              onClick={handleVinylClick}
              className={`absolute top-0 right-0 w-60 h-60 sm:w-76 sm:h-76 rounded-full transition-transform duration-700 ease-out cursor-pointer z-10 ${
                playing && activeTrack?.albumId === currentAlbum.id
                  ? 'translate-x-20 sm:translate-x-28 shadow-2xl'
                  : 'translate-x-12 sm:translate-x-16 shadow-xl hover:translate-x-16 sm:hover:translate-x-20'
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
                {/* Vinyl Grooves texture overlay */}
                <img
                  src="/images/vinyl-master.png"
                  alt="Vinyl grooves"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
                />

                {/* Center Label */}
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white/20 p-1 flex flex-col items-center justify-center text-center shadow-inner relative z-20"
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
                  <div className="w-4 h-4 rounded-full bg-black/90 border border-black/40 mt-1" />
                </div>
              </div>
            </div>

            {/* Album Sleeve Cover (Front) */}
            <div
              onClick={handleVinylClick}
              className="relative z-20 w-60 h-60 sm:w-76 sm:h-76 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/20 cursor-pointer group"
            >
              <img
                src={currentAlbum.coverImage}
                alt={currentAlbum.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Play overlay button on album jacket */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs">
                <div className="w-14 h-14 rounded-full bg-[#00e5ff] text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.6)]">
                  {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </div>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-white/90 truncate drop-shadow">
                  {currentAlbum.title}
                </span>
                <span className="px-2 py-0.5 bg-black/60 rounded text-[10px] text-[#00e5ff] font-mono border border-white/10">
                  {currentAlbum.releaseDate}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 text-xs text-neutral-400">
            <Disc3 className={`w-4 h-4 text-[#00e5ff] ${spinning ? 'animate-spin' : ''}`} />
            <span>Click cover or vinyl to {playing ? 'pause' : 'play legal preview stream'}</span>
          </div>
        </div>

        {/* Tracklist & Audio Controls */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#00e5ff] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentAlbum.type}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {currentAlbum.title}
            </h3>
          </div>

          {/* Player Bar & Equalizer */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (activeTrack) toggleAudio();
                    else if (currentAlbum.tracks.length > 0) handleTrackSelect(currentAlbum.tracks[0]);
                  }}
                  className="w-12 h-12 rounded-full bg-[#00e5ff] hover:bg-[#79ffe1] text-black flex items-center justify-center transition-transform hover:scale-105 shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer"
                  aria-label={playing ? 'Pause audio' : 'Play audio'}
                >
                  {playing ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  )}
                </button>
                <div>
                  <h4 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                    {displayedTrack?.title || 'Select a track'}
                  </h4>
                  <p className="text-xs text-neutral-400 flex items-center gap-2">
                    <span>Tomorrow X Together</span>
                    {playing && (
                      <span className="flex items-center gap-0.5 ml-1 text-[#00e5ff]">
                        <span className="w-1 bg-[#00e5ff] rounded-full inline-block bar-1"></span>
                        <span className="w-1 bg-[#00e5ff] rounded-full inline-block bar-2"></span>
                        <span className="w-1 bg-[#00e5ff] rounded-full inline-block bar-3"></span>
                        <span className="w-1 bg-[#00e5ff] rounded-full inline-block bar-4"></span>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Time Slice duration toggle selector */}
              <div className="flex items-center gap-1.5 bg-neutral-900 border border-white/10 rounded-md p-1">
                {[4, 15, 30].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSnippetDuration(sec)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      snippetDuration === sec
                        ? 'bg-[#00e5ff] text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#00e5ff] to-[#79ffe1] h-full transition-all duration-200"
                  style={{
                    width: `${Math.min(100, (currentTime / (duration || 30)) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>{currentTime ? `${currentTime.toFixed(1)}s` : '0:00'}</span>
                <span>Legal Preview (Public API Stream)</span>
                <span>{duration ? `${duration.toFixed(0)}s` : '0:30'}</span>
              </div>
            </div>

            {/* Official streaming links */}
            {displayedTrack?.externalLinks && (
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-neutral-400 text-[11px] font-medium">Listen Full Track:</span>
                <a
                  href={displayedTrack.externalLinks.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  Spotify <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={displayedTrack.externalLinks.appleMusic}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  Apple Music <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={displayedTrack.externalLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  YouTube MV <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Tracks list */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex justify-between">
              <span>Tracklist</span>
              <span>Duration Snippet</span>
            </div>
            {currentAlbum.tracks.map((track) => {
              const isCurrent = activeTrack?.albumId === currentAlbum.id && activeTrack?.title === track.title;
              return (
                <div
                  key={track.trackNo}
                  onClick={() => handleTrackSelect(track)}
                  className={`flex items-center justify-between p-3.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'bg-neutral-800/80 border-[#00e5ff]/50 shadow-[0_0_15px_rgba(0,229,255,0.15)] text-white'
                      : 'bg-neutral-900/40 border-white/5 text-neutral-300 hover:bg-neutral-800/50 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-neutral-500 w-5">
                      0{track.trackNo}
                    </span>
                    <button
                      className={`p-1.5 rounded-full transition-colors ${
                        isCurrent && playing
                          ? 'bg-[#00e5ff] text-black'
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
                  <span className="text-xs font-mono text-neutral-400">
                    from {track.startAtSecond}s
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
