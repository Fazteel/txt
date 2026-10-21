import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { currentUser, logoutUser } from '../../stores/authStore';
import { User, LogOut, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export default function UserNavIsland() {
  const user = useStore(currentUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  if (!user) {
    return (
      <a
        href="/login"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#F8138D]/15 border border-white/10 hover:border-[#F8138D]/40 text-neutral-300 hover:text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200 group"
      >
        <User className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#F8138D] transition-colors" />
        <span className="hidden sm:inline">Sign In</span>
      </a>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1 pl-2.5 pr-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#F8138D]/50 transition-all cursor-pointer group"
        aria-label="User Account Menu"
      >
        <span className="text-xs font-medium text-neutral-200 group-hover:text-white hidden sm:inline max-w-[90px] truncate">
          {user.name.split(' ')[0]}
        </span>
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#F8138D] to-[#f570b7] flex items-center justify-center text-xs shadow-[0_0_8px_rgba(248,19,141,0.5)]">
          {user.biasEmoji || '🐰'}
        </div>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.8)] p-3 text-left z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 pb-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#F8138D]">
                Verified MOA
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {user.membershipNumber}
              </span>
            </div>
            <div className="text-sm font-bold text-white truncate">{user.name}</div>
            <div className="text-xs text-neutral-400 font-mono truncate">@{user.username}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-neutral-300">
              <span>{user.biasEmoji}</span>
              <span>Bias: {user.bias}</span>
            </div>
          </div>

          <div className="py-2 space-y-1">
            <a
              href="/checkout"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 text-xs text-neutral-200 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F8138D]" />
                <span>Checkout & Ringkasan Belanja</span>
              </div>
            </a>
            <a
              href="/address"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 text-xs text-neutral-200 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#F8138D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Kelola Alamat</span>
              </div>
            </a>
            <a
              href="/store"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 text-xs text-neutral-200 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Official Merch Store</span>
              </div>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>
          </div>

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                logoutUser();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 text-xs text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
