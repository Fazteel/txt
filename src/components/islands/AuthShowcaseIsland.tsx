import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  currentUser,
  registerUser,
  addUserAddress,
  type UserAddress
} from '../../stores/authStore';
import {
  Sparkles,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthShowcaseIsland() {
  const user = useStore(currentUser);

  const [name, setName] = useState(user?.name || 'Aulia Rahma');
  const [email, setEmail] = useState(user?.email || 'aulia@email.com');
  const [phone, setPhone] = useState(user?.phone?.replace(/^\+62\s*/, '') || '812 3456 7890');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(true);

  const [addressLabel, setAddressLabel] = useState('Rumah');
  const [street, setStreet] = useState('Jl. Contoh No. 12');
  const [city, setCity] = useState('Bandung');
  const [province, setProvince] = useState('Jawa Barat');
  const [postalCode, setPostalCode] = useState('40123');

  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paidDone, setPaidDone] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fullPhone = phone.trim().startsWith('+62') ? phone.trim() : `+62 ${phone.trim()}`;
  const fullAddress = `${street}, ${city}, ${province} ${postalCode}`;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFeedbackMsg('Nama dan email wajib diisi.');
      return;
    }
    if (password.length < 8) {
      setFeedbackMsg('Kata sandi minimal 8 karakter.');
      return;
    }

    setIsRegistering(true);
    setTimeout(() => {
      const res = registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: fullPhone,
        password: password,
        initialAddress: {
          label: addressLabel,
          recipientName: name.trim(),
          phone: fullPhone,
          street: street.trim(),
          city: city.trim(),
          province: province.trim(),
          postalCode: postalCode.trim(),
          isDefault: true,
        },
      });
      setIsRegistering(false);
      if (res.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F8138D', '#f570b7', '#ffffff'],
          });
        } catch {}
        setFeedbackMsg('Akun berhasil didaftarkan dan terhubung ke checkout!');
      } else {
        setFeedbackMsg(res.error || 'Pendaftaran gagal.');
      }
    }, 500);
  };

  const handlePay = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaidDone(true);
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#F8138D', '#f570b7', '#00f2fe', '#ffffff'],
        });
      } catch {}
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <p className="text-xs text-neutral-400 mb-2 font-mono">1. Registrasi</p>
          <div className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#F4C0D1] text-[#72243E] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white">TOMORROW X TOGETHER</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Buat akun</h3>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Cukup sekali. Data ini dipakai otomatis saat checkout.
            </p>

            {feedbackMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-[#F8138D]/15 border border-[#F8138D]/30 text-[#f570b7] text-xs">
                {feedbackMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">Nama lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-lg px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-lg px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">No. HP</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-black/60 border border-white/15 rounded-lg text-neutral-300 font-mono text-xs">
                    +62
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-lg px-3 py-2 text-white focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Kata sandi</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-lg px-3 py-2 text-white focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Minimal 8 karakter.</p>
              </div>

              <label className="flex gap-2 items-start text-neutral-300 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="accent-[#F8138D] mt-0.5 rounded w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px] leading-relaxed text-neutral-400">
                  Saya setuju dengan syarat layanan dan kebijakan privasi.
                </span>
              </label>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 rounded-lg bg-[#993556] hover:bg-[#b83e66] text-white font-semibold text-xs tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isRegistering ? 'Menyimpan Akun...' : 'Daftar'}
              </button>

              <p className="text-center text-neutral-400 pt-1">
                Sudah punya akun?{' '}
                <a href="/login" className="text-[#F8138D] font-semibold hover:underline">
                  Masuk
                </a>
              </p>
            </form>
          </div>
        </div>

        <div>
          <p className="text-xs text-neutral-400 mb-2 font-mono">2. Checkout</p>
          <div className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Checkout</h3>

            {paidDone ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#F8138D] mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Pembayaran Sukses!</h4>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Paket resmi TOMORROW X TOGETHER siap dikirimkan ke alamat Anda.
                </p>
                <button
                  type="button"
                  onClick={() => setPaidDone(false)}
                  className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-300 font-medium">Penerima</span>
                    <a href="/profile" className="text-[#F8138D] hover:underline cursor-pointer">
                      Ubah di profil
                    </a>
                  </div>
                  <div className="bg-black/60 border border-white/5 rounded-lg p-3 space-y-1">
                    <div className="font-semibold text-white">{name || 'Aulia Rahma'}</div>
                    <div className="text-neutral-400">{email || 'aulia@email.com'}</div>
                    <div className="text-neutral-400 font-mono">{fullPhone}</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-300 font-medium">Alamat pengiriman</span>
                    <button
                      type="button"
                      onClick={() => setIsEditAddressOpen(!isEditAddressOpen)}
                      className="text-[#F8138D] hover:underline cursor-pointer"
                    >
                      {isEditAddressOpen ? 'Tutup form' : 'Tambah alamat'}
                    </button>
                  </div>

                  {isEditAddressOpen && (
                    <div className="p-3 mb-3 bg-black/60 border border-[#F8138D]/30 rounded-lg space-y-2 animate-in fade-in duration-150">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                          placeholder="Label (e.g. Rumah)"
                          className="bg-black/50 border border-white/15 focus:border-[#F8138D] rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="Kode Pos"
                          className="bg-black/50 border border-white/15 focus:border-[#F8138D] rounded px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Alamat jalan"
                        className="w-full bg-black/50 border border-white/15 focus:border-[#F8138D] rounded px-2.5 py-1.5 text-xs text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Kota"
                          className="bg-black/50 border border-white/15 focus:border-[#F8138D] rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          placeholder="Provinsi"
                          className="bg-black/50 border border-white/15 focus:border-[#F8138D] rounded px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="border border-white/15 rounded-lg p-3 flex gap-2.5 bg-black/40">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{addressLabel}</span>
                        <span className="text-[10px] bg-[#F8138D]/20 text-[#f570b7] border border-[#F8138D]/30 px-2 py-0.5 rounded-full font-semibold">
                          Utama
                        </span>
                      </div>
                      <div className="text-neutral-400 mt-1 leading-relaxed">
                        {fullAddress}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 space-y-1.5">
                  <div className="flex justify-between text-neutral-300">
                    <span>Lightstick x1</span>
                    <span className="font-mono">Rp 350.000</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Ongkir</span>
                    <span className="font-mono">Rp 20.000</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="font-mono text-[#f570b7]">Rp 370.000</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isPaying}
                  className="w-full py-2.5 rounded-lg bg-[#993556] hover:bg-[#b83e66] text-white font-semibold text-xs tracking-wide transition-all shadow-md cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isPaying ? 'Memproses...' : 'Bayar sekarang'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
