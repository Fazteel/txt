import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  currentUser,
  loginUser,
  registerUser,
  quickDemoLogin,
  logoutUser,
  type User
} from '../../stores/authStore';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MapPin,
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthIslandProps {
  initialMode?: 'login' | 'register';
  redirectPath?: string;
  showCheckoutPreview?: boolean;
}

const MEMBERS = [
  { id: 'soobin', name: 'Soobin', emoji: '🐰' },
  { id: 'yeonjun', name: 'Yeonjun', emoji: '🦊' },
  { id: 'beomgyu', name: 'Beomgyu', emoji: '🐻' },
  { id: 'taehyun', name: 'Taehyun', emoji: '🐿️' },
  { id: 'hueningkai', name: 'Hueningkai', emoji: '🐧' },
  { id: 'ot5', name: 'OT5 All', emoji: '⭐' },
];

export default function AuthIsland({
  initialMode = 'login',
  redirectPath = '/',
  showCheckoutPreview = false
}: AuthIslandProps) {
  const user = useStore(currentUser);
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [loginIdentifier, setLoginIdentifier] = useState('aulia@email.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regName, setRegName] = useState('Aulia Rahma');
  const [regEmail, setRegEmail] = useState('aulia@email.com');
  const [regPhone, setRegPhone] = useState('812 3456 7890');
  const [regPassword, setRegPassword] = useState('password123');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [selectedBias, setSelectedBias] = useState(MEMBERS[1]);
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [includeAddressNow, setIncludeAddressNow] = useState(true);
  const [addrLabel, setAddrLabel] = useState('Rumah');
  const [addrStreet, setAddrStreet] = useState('Jl. Contoh No. 12');
  const [addrCity, setAddrCity] = useState('Bandung');
  const [addrProvince, setAddrProvince] = useState('Jawa Barat');
  const [addrPostalCode, setAddrPostalCode] = useState('40123');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      window.location.href = redirectPath || '/';
    }
  }, [user, redirectPath]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F8138D', '#f570b7', '#ffffff', '#00f2fe'],
      });
    } catch {}
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMessage('Silakan isi email/username/no. HP dan kata sandi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = loginUser(loginIdentifier, loginPassword);
      setIsLoading(false);

      if (result.success && result.user) {
        triggerCelebration();
        window.location.href = redirectPath || '/';
      } else {
        setErrorMessage(result.error || 'Autentikasi gagal. Periksa kembali email dan kata sandi Anda.');
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Silakan masukkan email yang valid.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMessage('Kata sandi harus minimal 8 karakter.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage('Anda harus menyetujui syarat layanan dan kebijakan privasi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const formattedPhone = regPhone.trim().startsWith('+62') ? regPhone.trim() : `+62 ${regPhone.trim()}`;

      const initialAddress = includeAddressNow && addrStreet.trim() ? {
        label: addrLabel,
        recipientName: regName.trim(),
        phone: formattedPhone,
        street: addrStreet.trim(),
        city: addrCity.trim(),
        province: addrProvince.trim(),
        postalCode: addrPostalCode.trim(),
        isDefault: true,
      } : undefined;

      const result = registerUser({
        name: regName,
        email: regEmail,
        phone: formattedPhone,
        password: regPassword,
        bias: selectedBias.name,
        biasEmoji: selectedBias.emoji,
        initialAddress,
      });

      setIsLoading(false);

      if (result.success && result.user) {
        triggerCelebration();
        window.location.href = redirectPath || '/';
      } else {
        setErrorMessage(result.error || 'Gagal mendaftar akun.');
      }
    }, 500);
  };

  const fillMockupData = () => {
    setRegName('Aulia Rahma');
    setRegEmail('aulia@email.com');
    setRegPhone('812 3456 7890');
    setRegPassword('password123');
    setAddrStreet('Jl. Contoh No. 12');
    setAddrCity('Bandung');
    setAddrProvince('Jawa Barat');
    setAddrPostalCode('40123');
    setErrorMessage(null);
  };

  const fillLoginSample = () => {
    setLoginIdentifier('aulia@email.com');
    setLoginPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="relative bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute top-0 right-1/4 w-44 h-44 bg-[#F8138D]/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#F4C0D1] text-[#72243E] flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-white tracking-wide">TOMORROW X TOGETHER</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {mode === 'register' ? 'Buat akun' : 'Masuk ke akun'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            {mode === 'register'
              ? 'Cukup sekali. Data ini dipakai otomatis saat checkout.'
              : 'Gunakan data akun terdaftar untuk melanjutkan belanja dan akses eksklusif MOA.'}
          </p>
        </div>

        <div className="grid grid-cols-2 p-1 bg-black/50 border border-white/10 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-[#F8138D] to-[#f570b7] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Daftar Akun
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-[#F8138D] to-[#f570b7] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Masuk
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {mode === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nama lengkap
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Aulia Rahma"
                className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="aulia@email.com"
                className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                No. HP
              </label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-black/60 border border-white/15 rounded-xl text-neutral-300 text-xs font-mono">
                  +62
                </div>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="812 3456 7890"
                  className="flex-1 min-w-0 bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Kata sandi
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Minimal 8 karakter.</p>
            </div>

            <label className="flex gap-2 items-start text-xs text-neutral-300 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="accent-[#F8138D] mt-0.5 rounded w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[11px] leading-relaxed text-neutral-400">
                Saya setuju dengan syarat layanan dan kebijakan privasi.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(248,19,141,0.4)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <span>Daftar</span>
              )}
            </button>

            <div className="flex items-center justify-center pt-2 text-[11px]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-neutral-400 hover:text-white"
              >
                Sudah punya akun? <span className="text-[#F8138D] font-semibold ml-1">Masuk</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Email / No. HP / Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="aulia@email.com atau 0812..."
                  className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-9 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none"
                  required
                />
                <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Kata sandi
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-9 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none"
                  required
                />
                <Lock className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(248,19,141,0.4)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>

            <div className="flex items-center justify-center pt-1 text-[11px]">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-neutral-400 hover:text-white"
              >
                Belum punya akun? <span className="text-[#F8138D] font-semibold ml-1">Daftar</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
