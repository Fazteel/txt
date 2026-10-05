import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { activeMemberId, closeMemberModal, openMemberModal } from '../../stores/memberModalStore';
import membersData from '../../data/members.json';
import { X, ChevronLeft, ChevronRight, Music, Sparkles, Disc3 } from 'lucide-react';
import gsap from 'gsap';

export default function MemberModal() {
  const currentId = useStore(activeMemberId);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCustomOpen = (e: any) => {
      if (e.detail) {
        openMemberModal(e.detail);
      }
    };
    window.addEventListener('open-member-modal', handleCustomOpen);
    return () => window.removeEventListener('open-member-modal', handleCustomOpen);
  }, []);

  const currentIndex = membersData.findIndex((m) => m.id === currentId);
  const member = currentIndex !== -1 ? membersData[currentIndex] : null;

  useEffect(() => {
    if (!currentId) return;

    const lenisInstance = (window as any).__lenis;
    if (lenisInstance) {
      try {
        lenisInstance.stop();
      } catch (err) {
        console.warn('Could not pause Lenis:', err);
      }
    }

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouch = document.body.style.touchAction;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleWheelPrevent = (e: WheelEvent) => {
      e.stopPropagation();
    };

    const handleTouchPrevent = (e: TouchEvent) => {
      e.stopPropagation();
    };

    const containerEl = overlayRef.current;
    if (containerEl) {
      containerEl.addEventListener('wheel', handleWheelPrevent, { passive: false });
      containerEl.addEventListener('touchmove', handleTouchPrevent, { passive: false });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (lenisInstance) {
        try {
          lenisInstance.start();
        } catch (err) {}
      }
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.touchAction = originalBodyTouch;

      if (containerEl) {
        containerEl.removeEventListener('wheel', handleWheelPrevent);
        containerEl.removeEventListener('touchmove', handleTouchPrevent);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentId, currentIndex]);

  useEffect(() => {
    if (member && overlayRef.current && containerRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
      gsap.fromTo(
        containerRef.current,
        { scale: 0.94, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
      );
    }
  }, [currentId]);

  useEffect(() => {
    if (member && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
      );
    }
  }, [currentIndex]);

  const handleClose = () => {
    if (!overlayRef.current || !containerRef.current) {
      closeMemberModal();
      return;
    }

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
    });
    gsap.to(containerRef.current, {
      scale: 0.95,
      opacity: 0,
      y: 15,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        closeMemberModal();
      },
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      openMemberModal(membersData[currentIndex - 1].id);
    } else {
      openMemberModal(membersData[membersData.length - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < membersData.length - 1) {
      openMemberModal(membersData[currentIndex + 1].id);
    } else {
      openMemberModal(membersData[0].id);
    }
  };

  if (!member) return null;

  const currentNumberPill = `0${currentIndex + 1}`;
  const totalNumber = `0${membersData.length}`;

  return (
    <div
      ref={overlayRef}
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-black/85 backdrop-blur-2xl overflow-hidden select-none"
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
    >
      <div
        ref={containerRef}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="editorial-member-title"
        className="relative w-full max-w-[1340px] h-[92vh] sm:h-[90vh] max-h-[92vh] sm:max-h-[90vh] bg-[#121215] text-neutral-300 border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/[0.02] pointer-events-none" />
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-15 pointer-events-none"
          style={{ backgroundColor: member.themeColor || '#F8138D' }}
        />

        <div className="relative z-20 px-6 sm:px-8 py-3.5 border-b border-white/10 flex items-center justify-between gap-4 shrink-0 bg-[#121215]/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-neutral-400 block">
                {member.editorialDate || 'OCT 2026'}
              </span>
              <div className="w-8 h-0.5 bg-neutral-600 mt-1" />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <span className="text-xs font-serif italic text-neutral-400 block">Identity?</span>
              <span className="text-[10px] text-neutral-600 tracking-widest">...</span>
            </div>

            <div className="px-3 py-1 rounded-md bg-[#19191f] border border-white/10 text-xs font-mono tracking-[0.25em] text-neutral-300">
              {member.codeNumber || '10 02 02'}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:block text-right">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block">
                {currentNumberPill} / {totalNumber}
              </span>
              <p className="text-xs font-serif italic text-neutral-400 leading-tight">
                {member.quotePart1 || 'Please...'}
              </p>
              <p className="text-xs font-serif font-bold text-white leading-tight">
                {member.quotePart2 || 'Give me your blood'}
              </p>
            </div>

            <button
              onClick={handleClose}
              aria-label="Close Profile"
              className="group/close inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-xs font-mono tracking-wider text-neutral-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            >
              <span className="hidden sm:inline">CLOSE</span>
              <X className="w-4 h-4 transition-transform group-hover/close:rotate-90" />
            </button>
          </div>
        </div>

        <div
          data-lenis-prevent
          className="relative z-10 overflow-y-auto overscroll-contain flex-1 min-h-0 p-6 sm:p-8 lg:p-9 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent"
        >
          <div
            ref={contentRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-0 items-start"
          >
            <div className="lg:col-span-3 lg:pr-6 relative min-w-0">
              <div className="mb-4 min-w-0">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h2
                    id="editorial-member-title"
                    className={`font-display font-black tracking-tight text-white uppercase leading-none break-words ${
                      member.stageName.length > 7
                        ? 'text-2xl sm:text-3xl lg:text-[24px] xl:text-[28px]'
                        : 'text-2xl sm:text-3xl lg:text-3xl xl:text-4xl'
                    }`}
                  >
                    {member.stageName}
                  </h2>
                  <span className="text-base text-neutral-400 shrink-0 select-none">{member.emoticon}</span>
                </div>
                <p className="text-xs font-mono text-neutral-400 mt-2 tracking-wide capitalize">
                  {member.editorialSubtitle || member.role}
                </p>
                <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                  {member.fullName} • {member.hangul}
                </p>
              </div>

              <div className="relative aspect-[3/4] max-h-[270px] sm:max-h-[300px] rounded-xl overflow-hidden bg-neutral-950 border border-black/40 group max-w-[240px] mx-auto lg:mx-0">
                <img
                  src={member.photoFrame || member.photoThumb}
                  alt={member.stageName}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              </div>

              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-white/10">
                <span className="absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full border border-neutral-500 bg-[#121215]" />
              </div>
            </div>

            <div className="lg:col-span-3 lg:px-6 relative min-w-0">
              <div className="mb-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-serif text-white tracking-wide">
                    Biodata
                  </h3>
                  <span className="text-[10px] font-mono tracking-widest text-[#F8138D] uppercase font-semibold">
                    Profile
                  </span>
                </div>
                <div className="w-full h-px bg-white/15 mt-2" />
              </div>

              <div className="space-y-2.5 my-3 max-h-[380px] sm:max-h-[440px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
                {member.biodata?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="pb-2 border-b border-white/5 last:border-b-0 flex flex-col gap-0.5 group/bio"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      {item.label}
                    </span>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] text-[#F8138D] hover:text-white font-medium transition-colors group-hover/bio:translate-x-0.5 transform duration-200"
                      >
                        <span>{item.value}</span>
                        <svg
                          className="w-3 h-3 opacity-70 group-hover/bio:opacity-100 transition-opacity"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7 17L17 7" />
                          <path d="M7 7h10v10" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-xs sm:text-[13px] text-neutral-200 font-medium leading-snug">
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-white/10" />
            </div>

            <div className="lg:col-span-3 lg:px-6 relative min-w-0">
              <div className="rounded-xl overflow-hidden bg-neutral-950 border border-white/10 aspect-[16/10] max-h-[160px] sm:max-h-[180px] mb-4 shadow-lg group">
                <img
                  src={member.photoStory1 || member.photoThumb}
                  alt={`${member.stageName} Story 01`}
                  className="w-full h-full object-cover object-top filter grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="space-y-2.5">
                <h3 className="text-3xl font-display font-black text-white tracking-tight leading-none">
                  01
                </h3>
                <p className="text-xs sm:text-sm font-light text-neutral-300 leading-relaxed font-sans text-justify opacity-95">
                  {member.story01 || member.vocalRole}
                </p>
              </div>

              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-white/10" />
            </div>

            <div className="lg:col-span-3 lg:px-6 relative min-w-0">
              <div className="rounded-xl overflow-hidden bg-neutral-950 border border-white/10 aspect-[16/10] max-h-[160px] sm:max-h-[180px] mb-4 shadow-lg group">
                <img
                  src={member.photoCloseup || member.photoThumb}
                  alt={`${member.stageName} Close-up 02`}
                  className="w-full h-full object-cover object-center filter grayscale contrast-130 transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="space-y-2.5">
                <h3 className="text-3xl font-display font-black text-white tracking-tight leading-none">
                  02
                </h3>
                <p className="text-xs sm:text-sm font-light text-neutral-300 leading-relaxed font-sans text-justify opacity-95">
                  {member.story02 || member.tmi?.join(' ')}
                </p>
              </div>

              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-white/10">
                <span className="absolute -left-[5px] bottom-10 w-2.5 h-2.5 rounded-full border border-neutral-500 bg-[#121215]" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 px-6 sm:px-8 py-3.5 border-t border-white/10 bg-[#0e0e11] flex items-center justify-between gap-4 shrink-0">
          <button
            onClick={handlePrev}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white transition-all cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Prev Member</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-none">
            {membersData.map((m) => (
              <button
                key={m.id}
                onClick={() => openMemberModal(m.id)}
                className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  m.id === member.id
                    ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105'
                    : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {m.stageName}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white transition-all cursor-pointer group"
          >
            <span className="hidden sm:inline">Next Member</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
