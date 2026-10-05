import React, { useState, useEffect, useMemo } from 'react';
import schedulesData from '../../data/schedules.json';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Ticket,
  Sparkles,
  ChevronRight,
  Globe,
  Radio,
} from 'lucide-react';

export interface ScheduleItem {
  id: string;
  tourName: string;
  day: string;
  dayName: string;
  month: string;
  year: string;
  city: string;
  country: string;
  venue: string;
  status: 'Available' | 'Selling Fast' | 'Sold Out' | string;
  doorOpen?: string;
  showTime: string;
  ticketUrl: string;
  posterImage: string;
  targetDate?: string;
}

export default function ScheduleSplitGrid() {
  const schedules = schedulesData as ScheduleItem[];
  const [selectedId, setSelectedId] = useState<string>(schedules[1]?.id || schedules[0]?.id);
  const [countdown, setCountdown] = useState({ days: 18, hours: 14, mins: 32, secs: 45 });

  const activeItem = useMemo(() => {
    return schedules.find((s) => s.id === selectedId) || schedules[0];
  }, [selectedId, schedules]);

  useEffect(() => {
    const target = activeItem.targetDate ? new Date(activeItem.targetDate).getTime() : new Date('2026-10-24T19:00:00+07:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ days, hours, mins, secs });
      } else {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeItem]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('available')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Available
        </span>
      );
    }
    if (s.includes('selling') || s.includes('fast')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/40 text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Selling Fast
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-800 border border-white/10 text-neutral-400">
        Sold Out
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="relative rounded-3xl bg-[#121216] border border-white/10 p-5 sm:p-6 shadow-2xl overflow-hidden group">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#F8138D]/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#F8138D]">
                <Radio className="w-3.5 h-3.5 animate-pulse text-[#F8138D]" />
                <span>Featured Stage</span>
              </span>
              <span className="text-[11px] font-mono text-neutral-400 font-semibold">
                {activeItem.tourName}
              </span>
            </div>

            <div className="relative w-full aspect-[3/4] max-w-[360px] mx-auto rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-neutral-900 mb-6">
              <img
                key={activeItem.id}
                src={activeItem.posterImage}
                alt={`${activeItem.city} Concert Poster`}
                className="w-full h-full object-cover transition-all duration-700 ease-out transform group-hover:scale-102 animate-[fadeIn_0.5s_ease-out]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

              <div className="absolute bottom-4 inset-x-4 pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/60 backdrop-blur-md border border-white/20 text-[#00e5ff]">
                    {activeItem.country}
                  </span>
                  <span className="text-xs font-mono text-neutral-300">
                    {activeItem.month} {activeItem.day}, {activeItem.year}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight drop-shadow-md">
                  {activeItem.city}
                </h3>
                <p className="text-xs text-neutral-300 font-medium truncate">
                  {activeItem.venue}
                </p>
              </div>
            </div>

            <div className="mb-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 relative z-10">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#F8138D]" />
                  <span>Countdown to Stage</span>
                </span>
                <span className="text-[10px] font-mono text-[#00e5ff] font-bold">
                  {activeItem.showTime}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-xl sm:text-2xl font-black font-display text-white block">
                    {String(countdown.days).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400 uppercase">Days</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-xl sm:text-2xl font-black font-display text-white block">
                    {String(countdown.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400 uppercase">Hours</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-xl sm:text-2xl font-black font-display text-white block">
                    {String(countdown.mins).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400 uppercase">Mins</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-xl sm:text-2xl font-black font-display text-[#F8138D] block">
                    {String(countdown.secs).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400 uppercase">Secs</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <a
                href={activeItem.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F8138D] to-[#d6006e] hover:from-[#ff2098] hover:to-[#ea0078] text-white font-mono text-xs uppercase tracking-widest font-bold shadow-[0_10px_30px_rgba(248,19,141,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Get Tickets • {activeItem.city}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#F8138D] font-bold block mb-1">
                Tour Itinerary & Venues
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
                Upcoming Tour Dates
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-neutral-400">
                Hover to preview poster
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {schedules.map((item) => {
              const isSelected = item.id === selectedId;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedId(item.id)}
                  onClick={() => setSelectedId(item.id)}
                  className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#181822] border-[#F8138D]/60 shadow-[0_10px_35px_rgba(248,19,141,0.2)] -translate-y-0.5'
                      : 'bg-[#121216]/70 border-white/10 hover:border-white/25 hover:bg-[#15151c]'
                  }`}
                >
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center text-center group-hover:border-[#F8138D]/50 transition-colors">
                      <span className="text-2xl sm:text-3xl font-display font-black text-white leading-none">
                        {item.day}
                      </span>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#F8138D] uppercase mt-0.5">
                        {item.month}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-neutral-400">
                          {item.dayName}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[11px] font-mono text-neutral-500">
                          {item.year}
                        </span>
                      </div>

                      <h4 className="text-lg sm:text-xl font-display font-bold text-white uppercase group-hover:text-[#F8138D] transition-colors leading-tight">
                        {item.city}
                      </h4>
                      <p className="text-xs text-neutral-400 font-medium">
                        {item.country}
                      </p>
                    </div>
                  </div>

                  <div className="sm:border-l sm:border-white/10 sm:pl-4 space-y-1 flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
                      <span className="line-clamp-1">{item.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                      <Clock className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span>Show: {item.showTime}</span>
                      {item.doorOpen && (
                        <>
                          <span>•</span>
                          <span>Door: {item.doorOpen}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {getStatusBadge(item.status)}

                    <a
                      href={item.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                        item.status.toLowerCase().includes('sold')
                          ? 'bg-white/5 text-neutral-500 pointer-events-none'
                          : isSelected
                          ? 'bg-[#F8138D] text-white hover:bg-[#ff2098] shadow-md'
                          : 'bg-white/10 text-neutral-200 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      <span>Tickets</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
