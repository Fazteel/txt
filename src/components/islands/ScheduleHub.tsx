import React, { useState, useMemo, useRef, useEffect } from 'react';
import schedulesData from '../../data/schedules.json';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Ticket,
  Check,
  Compass,
  Radio
} from 'lucide-react';

export interface ScheduleEvent {
  id: string;
  date: string;
  day: string;
  dayName: string;
  monthYear: string;
  category: string;
  eventType: string;
  title: string;
  city: string;
  country: string;
  venue: string;
  doorOpen?: string;
  showTime: string;
  ticketStatus: 'available' | 'selling_fast' | 'sold_out' | 'free_stream' | 'lottery_closed' | string;
  ticketUrl: string;
  highlight?: boolean;
}

export default function ScheduleHub() {
  const months = ['OCT 2026', 'NOV 2026', 'DEC 2026'];
  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'tour', label: 'Tour & Concert' },
    { id: 'media', label: 'Media & Live' },
  ];

  const [selectedMonth, setSelectedMonth] = useState<string>('OCT 2026');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-24');
  const [calendarAdded, setCalendarAdded] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const daysInMonth = useMemo(() => {
    const [monthName, yearStr] = selectedMonth.split(' ');
    const year = parseInt(yearStr, 10);
    const monthIndex = monthName === 'OCT' ? 9 : monthName === 'NOV' ? 10 : 11;
    const numDays = new Date(year, monthIndex + 1, 0).getDate();

    const days = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let d = 1; d <= numDays; d++) {
      const dateObj = new Date(year, monthIndex, d);
      const dayStr = d < 10 ? `0${d}` : `${d}`;
      const monthStr = monthIndex + 1 < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;
      const isoDate = `${year}-${monthStr}-${dayStr}`;
      const dayName = dayNames[dateObj.getDay()];

      days.push({
        dayNumber: dayStr,
        dayName,
        isoDate,
      });
    }
    return days;
  }, [selectedMonth]);

  const filteredEvents = useMemo(() => {
    return (schedulesData as ScheduleEvent[]).filter((ev) => {
      const matchesCategory = selectedCategory === 'all' || ev.category === selectedCategory;
      return matchesCategory;
    });
  }, [selectedCategory]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduleEvent>();
    filteredEvents.forEach((ev) => {
      map.set(ev.date, ev);
    });
    return map;
  }, [filteredEvents]);

  useEffect(() => {
    const currentMonthEvents = filteredEvents.filter((ev) => ev.monthYear === selectedMonth);
    if (currentMonthEvents.length > 0) {
      if (!currentMonthEvents.some((ev) => ev.date === selectedDate)) {
        setSelectedDate(currentMonthEvents[0].date);
      }
    } else {
      const [monthName, yearStr] = selectedMonth.split(' ');
      const mStr = monthName === 'OCT' ? '10' : monthName === 'NOV' ? '11' : '12';
      setSelectedDate(`${yearStr}-${mStr}-01`);
    }
  }, [selectedMonth, selectedCategory]);

  const currentEvent = eventsByDate.get(selectedDate);

  const scrollStrip = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#962a64]/20 text-[#f570b7] border border-[#F8138D]/40 shadow-[0_0_12px_rgba(248,19,141,0.25)]">
            <span className="w-2 h-2 rounded-full bg-[#F8138D] animate-pulse"></span>
            Tickets Available
          </span>
        );
      case 'selling_fast':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Selling Fast
          </span>
        );
      case 'sold_out':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
            Sold Out
          </span>
        );
      case 'free_stream':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-pink-500/15 text-pink-300 border border-pink-500/40 shadow-[0_0_12px_rgba(248,19,141,0.25)]">
            <Radio className="w-3 h-3 animate-pulse" />
            Free Global Stream
          </span>
        );
      case 'lottery_closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-neutral-800 text-neutral-400 border border-neutral-700">
            Lottery Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
            {status}
          </span>
        );
    }
  };

  const handleAddToCalendar = () => {
    if (!currentEvent) return;
    const title = encodeURIComponent(currentEvent.title);
    const location = encodeURIComponent(`${currentEvent.venue}, ${currentEvent.city}`);
    const details = encodeURIComponent(
      `Tomorrow X Together Official Schedule\nShow Time: ${currentEvent.showTime}\nMore info: https://weverse.io/txt`
    );
    const dateFormatted = currentEvent.date.replace(/-/g, '');
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}T100000Z/${dateFormatted}T130000Z&details=${details}&location=${location}`;

    window.open(gCalUrl, '_blank');
    setCalendarAdded(true);
    setTimeout(() => setCalendarAdded(false), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-[#121215] border border-white/10 rounded-full shadow-inner">
            {months.map((m) => {
              const isSelected = selectedMonth === m;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-[#F8138D] text-white shadow-[0_0_15px_rgba(248,19,141,0.4)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'border-[#F8138D] text-white bg-[#F8138D]/15 shadow-[0_0_15px_rgba(248,19,141,0.2)]'
                    : 'border-white/10 text-neutral-400 hover:text-white hover:border-white/30 bg-transparent'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative group">
        <button
          onClick={() => scrollStrip('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:border-[#F8138D] hover:text-[#F8138D] transition-all opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto py-4 px-2 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {daysInMonth.map((dayObj) => {
            const hasEvent = eventsByDate.has(dayObj.isoDate);
            const isSelected = selectedDate === dayObj.isoDate;
            const eventInfo = eventsByDate.get(dayObj.isoDate);

            return (
              <button
                key={dayObj.isoDate}
                onClick={() => setSelectedDate(dayObj.isoDate)}
                className={`relative shrink-0 w-20 sm:w-24 h-24 sm:h-28 rounded-xl flex flex-col items-center justify-between p-3 border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181d] border-[#F8138D] shadow-[0_0_20px_rgba(248,19,141,0.35)] -translate-y-1'
                    : hasEvent
                    ? 'bg-[#131317] border-white/20 hover:border-[#F8138D]/70 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(248,19,141,0.15)]'
                    : 'bg-[#0f0f12]/60 border-white/5 opacity-55 hover:opacity-100 hover:border-white/20 hover:-translate-y-0.5'
                }`}
              >
                <span
                  className={`text-[11px] font-mono font-bold tracking-widest uppercase ${
                    isSelected ? 'text-[#f570b7]' : 'text-neutral-400'
                  }`}
                >
                  {dayObj.dayName}
                </span>

                <span
                  className={`text-2xl sm:text-3xl font-display font-black tracking-tight ${
                    isSelected ? 'text-white scale-105' : 'text-neutral-200'
                  }`}
                >
                  {dayObj.dayNumber}
                </span>

                <div className="h-2 flex items-center justify-center">
                  {hasEvent ? (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        eventInfo?.category === 'tour'
                          ? 'bg-[#F8138D] shadow-[0_0_8px_#F8138D] animate-pulse'
                          : 'bg-[#f570b7] shadow-[0_0_8px_#f570b7]'
                      }`}
                    />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-neutral-800" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scrollStrip('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:border-[#F8138D] hover:text-[#F8138D] transition-all opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="relative rounded-2xl bg-gradient-to-b from-[#141418] to-[#0c0c0f] border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden transition-all duration-500">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#962a64]/15 blur-[100px] pointer-events-none" />

        {currentEvent ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase bg-white/10 text-white border border-white/15">
                  {currentEvent.eventType}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {currentEvent.date} ({currentEvent.dayName})
                </span>
                {currentEvent.highlight && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#f570b7] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Headline Act
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight text-white uppercase drop-shadow-md">
                  {currentEvent.city}
                  <span className="text-[#F8138D] ml-2">.{currentEvent.country}</span>
                </h3>
                <h4 className="text-xl sm:text-2xl font-display font-semibold text-neutral-200 mt-1">
                  {currentEvent.title}
                </h4>
              </div>

              <div className="flex items-center gap-2 text-sm text-neutral-400 pt-2">
                <MapPin className="w-4 h-4 text-[#F8138D] shrink-0" />
                <span className="font-medium text-neutral-300">{currentEvent.venue}</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-xl bg-black/50 border border-white/10 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                    Ticket Status
                  </span>
                  {getStatusBadge(currentEvent.ticketStatus)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {currentEvent.doorOpen && (
                    <div>
                      <span className="text-[11px] font-mono text-neutral-500 uppercase block">
                        Gate Open
                      </span>
                      <span className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {currentEvent.doorOpen}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] font-mono text-neutral-500 uppercase block">
                      Show Time
                    </span>
                    <span className="text-sm font-bold text-[#f570b7] font-mono flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#f570b7]" />
                      {currentEvent.showTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {currentEvent.ticketStatus === 'sold_out' ? (
                  <button
                    disabled
                    className="w-full py-3.5 bg-neutral-800 text-neutral-500 font-bold uppercase text-xs tracking-wider rounded-lg cursor-not-allowed border border-white/5"
                  >
                    Official Tickets Sold Out
                  </button>
                ) : (
                  <a
                    href={currentEvent.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-[#F8138D] hover:bg-[#f570b7] text-white font-bold uppercase text-xs tracking-wider rounded-lg shadow-[0_0_20px_rgba(248,19,141,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    {currentEvent.ticketStatus === 'free_stream'
                      ? 'Watch Live Stream'
                      : 'Buy Official Tickets'}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={handleAddToCalendar}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium text-xs tracking-wider rounded-lg border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {calendarAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#f570b7]" />
                      <span className="text-[#f570b7]">Added to Calendar</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Add to Google / Apple Calendar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4 relative z-10">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#f570b7] uppercase tracking-widest">
                <Compass className="w-3 h-3 text-[#f570b7]" />
                Rest Day / Studio Rehearsal
              </div>
              <h3 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
                PREPARATION & VOCAL PRACTICE
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                No official public concert scheduled on {selectedDate}. The five members are undergoing intensive choreography rehearsal and studio recording for the upcoming tour stages.
              </p>
              <div className="pt-2 text-xs text-neutral-500 font-mono">
                Exclusive behind-the-scenes logs and practice footage will be released on Weverse.
              </div>
            </div>

            <div className="shrink-0 w-64 p-3 bg-neutral-900 border border-white/15 rounded-xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/60">
                <img
                  src="/images/group-photo.png"
                  alt="Tomorrow X Together in studio rehearsal"
                  className="w-full h-full object-cover filter contrast-110 brightness-90"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs rounded text-[9px] font-mono text-[#f570b7]">
                  PRACTICE LOG // {selectedDate}
                </div>
              </div>
              <div className="mt-2 text-center text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                TXT OFFICIAL STUDIO ARCHIVE
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
