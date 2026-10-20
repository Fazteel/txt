import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { currentUser, logoutUser, type User } from '../../stores/authStore';
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  Calendar,
  LogOut,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Award,
  ArrowRight,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

const MEMBERS = [
  { id: 'soobin', name: 'Soobin', role: 'Leader & Vocalist', emoji: '🐰' },
  { id: 'yeonjun', name: 'Yeonjun', role: 'Vocalist, Rapper & Dancer', emoji: '🦊' },
  { id: 'beomgyu', name: 'Beomgyu', role: 'Vocalist & Performer', emoji: '🐻' },
  { id: 'taehyun', name: 'Taehyun', role: 'Vocalist & Performer', emoji: '🐿️' },
  { id: 'hueningkai', name: 'Hueningkai', role: 'Vocalist & Maknae', emoji: '🐧' },
  { id: 'ot5', name: 'OT5 All', role: 'One Dream with Tomorrow', emoji: '⭐' },
];

export default function ProfileIsland() {
  const user = useStore(currentUser);
  const [selectedBias, setSelectedBias] = useState<string | null>(null);
  const [isUpdatingBias, setIsUpdatingBias] = useState(false);

  if (!user) {
    return (
      <div className="w-full max-w-md mx-auto bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F8138D]/10 border border-[#F8138D]/30 text-[#F8138D] mx-auto mb-4 flex items-center justify-center">
          <UserIcon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-display text-white mb-2">Sign In Required</h2>
        <p className="text-xs text-neutral-400 mb-6">
          You must be logged in to access your Official Digital MOA Membership Pass.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-semibold uppercase tracking-wider"
          >
            Create Account
          </a>
        </div>
      </div>
    );
  }

  const handleUpdateBias = (member: typeof MEMBERS[0]) => {
    setIsUpdatingBias(true);
    const updated: User = {
      ...user,
      bias: member.name,
      biasEmoji: member.emoji,
    };
    currentUser.set(updated);
    try {
      localStorage.setItem('txt_current_user', JSON.stringify(updated));
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F8138D', '#f570b7', '#ffffff'],
      });
    } catch {}
    setTimeout(() => {
      setIsUpdatingBias(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <div className="relative rounded-3xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-7 sm:p-9 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F8138D]/20 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-black text-[#F8138D] font-display">+ × +</span>
                <div>
                  <div className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                    BIGHIT MUSIC / HYBE
                  </div>
                  <div className="text-xs font-bold text-white tracking-wider">
                    OFFICIAL DIGITAL FAN PASS
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#F8138D]/20 border border-[#F8138D]/40 text-[#f570b7]">
                5TH GEN
              </span>
            </div>

            <div className="py-6 space-y-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F8138D] to-[#f570b7] p-0.5 shadow-[0_0_15px_rgba(248,19,141,0.4)]">
                  <div className="w-full h-full rounded-2xl bg-neutral-950 flex items-center justify-center text-3xl">
                    {user.biasEmoji || '🐰'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    Fan Name
                  </div>
                  <h3 className="text-xl font-bold text-white">{user.name}</h3>
                  <div className="text-xs font-mono text-[#F8138D]">@{user.username}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Membership Number
                  </div>
                  <div className="text-xs font-mono font-bold text-neutral-200 mt-0.5">
                    {user.membershipNumber}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Bias / Favorite
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1">
                    <span>{user.biasEmoji}</span>
                    <span>{user.bias}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Tier
                  </div>
                  <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                    {user.membershipTier}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 relative z-10 font-mono">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F8138D]" />
                <span>Verified Fan Certificate</span>
              </div>
              <span>Member Since: {user.joinedAt}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider font-display text-white mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#F8138D]" />
              <span>Change Your Member Bias</span>
            </h4>
            <p className="text-xs text-neutral-400 mb-4">
              Select your favorite Tomorrow X Together member to personalize your membership pass and turntable highlights.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {MEMBERS.map((m) => {
                const isSelected = user.bias === m.name;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleUpdateBias(m)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-[#F8138D] bg-[#F8138D]/20 shadow-[0_0_12px_rgba(248,19,141,0.3)]'
                        : 'border-white/10 bg-black/40 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider font-display text-white mb-2">
              Fan Actions
            </h4>
            <a
              href="/address"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#F8138D]" />
                <span>Alamat Pengiriman & Checkout</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="/store"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[#F8138D]" />
                <span>Shop Exclusive Merch</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="/#discography-section"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Play Turntable Vinyl Records</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={() => logoutUser()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-xs font-medium text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of MOA Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
