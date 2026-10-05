import React, { useState } from 'react';

export interface VinylRecordProps {
  coverImage: string;
  albumTitle: string;
  themeColor?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VinylRecord({
  coverImage,
  albumTitle,
  themeColor = '#00e5ff',
  isPlaying = false,
  onTogglePlay,
  className = '',
  size = 'md',
}: VinylRecordProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-48 h-48 sm:w-56 sm:h-56',
    md: 'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96',
    lg: 'w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px]',
  };

  return (
    <div
      className={`relative select-none group cursor-pointer perspective-[1000px] ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onTogglePlay}
    >
      <div
        className={`absolute inset-y-1.5 right-1.5 w-[94%] aspect-square rounded-full z-10 transition-all duration-700 ease-out origin-center shadow-2xl pointer-events-none ${
          isHovered || isPlaying
            ? 'translate-x-[48%] md:translate-x-[52%] shadow-[0_20px_40px_rgba(0,0,0,0.8)]'
            : 'translate-x-[15%] shadow-[0_10px_25px_rgba(0,0,0,0.5)]'
        }`}
      >
        <div
          className={`w-full h-full relative rounded-full ${
            isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
          }`}
          style={{
            animationPlayState: isPlaying ? 'running' : 'paused',
          }}
        >
          <img
            src="/images/vinyl-master.png"
            alt="Vinyl Disc"
            className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            loading="lazy"
          />

          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none" />

          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34%] aspect-square rounded-full overflow-hidden border-2 border-white/20 shadow-inner flex flex-col items-center justify-center p-2 text-center"
            style={{
              backgroundColor: themeColor,
              boxShadow: `0 0 25px ${themeColor}40, inset 0 0 15px rgba(0,0,0,0.6)`,
            }}
          >
            <img
              src={coverImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay filter blur-[0.5px]"
            />
            <div className="relative z-10 text-[8px] sm:text-[10px] font-mono font-black tracking-widest text-black/90 uppercase line-clamp-1">
              TXT
            </div>
            <div className="relative z-10 text-[7px] sm:text-[8px] font-bold text-black/80 line-clamp-1 max-w-[90%]">
              {albumTitle}
            </div>

            <div className="w-4 h-4 rounded-full bg-[#0a0a0d] border border-black/80 shadow-inner mt-0.5 z-20" />
          </div>
        </div>
      </div>

      <div
        className={`relative z-20 w-full h-full rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden transition-all duration-500 ease-out shadow-2xl ${
          isPlaying
            ? 'scale-[1.02] -translate-y-2 border-white/30 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(255,255,255,0.1)]'
            : isHovered
            ? 'scale-[1.01] -translate-y-1 border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
            : 'shadow-[0_15px_35px_rgba(0,0,0,0.7)]'
        }`}
      >
        <img
          src={coverImage}
          alt={albumTitle}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />

        <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-black/70 to-transparent pointer-events-none" />

        {isPlaying && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#F8138D]/60 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#F8138D] animate-ping" />
            <span className="text-[10px] font-mono tracking-wider text-white uppercase font-bold">
              Playing
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
