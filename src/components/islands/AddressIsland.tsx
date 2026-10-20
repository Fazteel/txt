import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  currentUser,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setSelectedAddress,
  updateUserRecipient,
  type UserAddress
} from '../../stores/authStore';
import { cartItems, cartSubtotal, clearCart } from '../../stores/cartStore';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Package,
  ShoppingBag,
  ExternalLink,
  Phone,
  User,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddressIslandProps {
  showCheckoutSimulation?: boolean;
}

export default function AddressIsland({ showCheckoutSimulation = true }: AddressIslandProps) {
  const user = useStore(currentUser);
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [modalLabel, setModalLabel] = useState('Rumah');
  const [modalRecipient, setModalRecipient] = useState(user?.name || 'Aulia Rahma');
  const [modalPhone, setModalPhone] = useState(user?.phone?.replace(/^\+62\s*/, '') || '812 3456 7890');
  const [modalStreet, setModalStreet] = useState('Jl. Contoh No. 12');
  const [modalCity, setModalCity] = useState('Bandung');
  const [modalProvince, setModalProvince] = useState('Jawa Barat');
  const [modalPostalCode, setModalPostalCode] = useState('40123');
  const [modalIsDefault, setModalIsDefault] = useState(true);

  const [isEditRecipientOpen, setIsEditRecipientOpen] = useState(false);
  const [recipientName, setRecipientName] = useState(user?.name || 'Aulia Rahma');
  const [recipientEmail, setRecipientEmail] = useState(user?.email || 'aulia@email.com');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '+62 812 3456 7890');

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const addresses = user?.addresses || [
    {
      id: 'addr_sample',
      label: 'Rumah',
      recipientName: user?.name || 'Aulia Rahma',
      phone: user?.phone || '+62 812 3456 7890',
      street: 'Jl. Contoh No. 12',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40123',
      isDefault: true,
    },
  ];

  const selectedAddress =
    addresses.find((a) => a.id === user?.selectedAddressId) ||
    addresses.find((a) => a.isDefault) ||
    addresses[0];

  const openAddModal = () => {
    setEditingAddressId(null);
    setModalLabel('Rumah');
    setModalRecipient(user?.name || '');
    setModalPhone(user?.phone?.replace(/^\+62\s*/, '') || '');
    setModalStreet('');
    setModalCity('Bandung');
    setModalProvince('Jawa Barat');
    setModalPostalCode('');
    setModalIsDefault(addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const openEditModal = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setModalLabel(addr.label);
    setModalRecipient(addr.recipientName);
    setModalPhone(addr.phone.replace(/^\+62\s*/, ''));
    setModalStreet(addr.street);
    setModalCity(addr.city);
    setModalProvince(addr.province);
    setModalPostalCode(addr.postalCode);
    setModalIsDefault(addr.isDefault);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = modalPhone.startsWith('+62') ? modalPhone : `+62 ${modalPhone.trim()}`;

    if (editingAddressId) {
      updateUserAddress(editingAddressId, {
        label: modalLabel,
        recipientName: modalRecipient,
        phone: formattedPhone,
        street: modalStreet,
        city: modalCity,
        province: modalProvince,
        postalCode: modalPostalCode,
        isDefault: modalIsDefault,
      });
    } else {
      addUserAddress({
        label: modalLabel,
        recipientName: modalRecipient,
        phone: formattedPhone,
        street: modalStreet,
        city: modalCity,
        province: modalProvince,
        postalCode: modalPostalCode,
        isDefault: modalIsDefault,
      });
    }
    setIsAddressModalOpen(false);
  };

  const handleSaveRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserRecipient(recipientName, recipientEmail, recipientPhone);
    setIsEditRecipientOpen(false);
  };

  const handlePay = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutDone(true);
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#F8138D', '#f570b7', '#00f2fe', '#ffffff'],
        });
      } catch {}
      clearCart();
    }, 1000);
  };

  const hasCartItems = items.length > 0;
  const shippingFee = 20000;
  const itemsTotalRupiah = hasCartItems ? Math.round(subtotal * 16000) : 350000;
  const grandTotalRupiah = itemsTotalRupiah + shippingFee;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#F8138D]" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                  Daftar Alamat Pengiriman
                </h3>
              </div>
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8138D]/15 hover:bg-[#F8138D]/25 border border-[#F8138D]/30 text-[#f570b7] hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Alamat</span>
              </button>
            </div>

            <p className="text-xs text-neutral-400 mb-4">
              Pilih alamat tujuan utama untuk pengiriman merchandise dan album resmi TOMORROW X TOGETHER.
            </p>

            <div className="space-y-3">
              {addresses.map((addr) => {
                const isSelected = selectedAddress?.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-neutral-800/80 border-[#F8138D] shadow-[0_0_15px_rgba(248,19,141,0.2)]'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <MapPin
                            className={`w-4 h-4 ${isSelected ? 'text-[#F8138D]' : 'text-neutral-500'}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-white">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F8138D]/20 text-[#f570b7] border border-[#F8138D]/30 font-semibold">
                                Utama
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Terpilih
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-medium text-neutral-200">
                            {addr.recipientName} ({addr.phone})
                          </div>
                          <div className="text-xs text-neutral-400 mt-1 leading-relaxed">
                            {addr.street}, {addr.city}, {addr.province} {addr.postalCode}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(addr);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                          title="Ubah Alamat"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteUserAddress(addr.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                            title="Hapus Alamat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#F8138D]" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Informasi Penerima Utama
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditRecipientOpen(true)}
                className="text-xs text-[#F8138D] hover:underline cursor-pointer"
              >
                Ubah di profil
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/40 border border-white/5 rounded-xl p-4 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-0.5">Nama</span>
                <span className="text-white font-semibold">{user?.name || 'Aulia Rahma'}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-0.5">Email</span>
                <span className="text-neutral-300 truncate block">{user?.email || 'aulia@email.com'}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-0.5">No. HP</span>
                <span className="text-neutral-300 font-mono">{user?.phone || '+62 812 3456 7890'}</span>
              </div>
            </div>
          </div>
        </div>

        {showCheckoutSimulation && (
          <div className="lg:col-span-5">
            <div className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#F8138D]" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">
                    Checkout
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                  Preview Otomatis
                </span>
              </div>

              {checkoutDone ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#F8138D] mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-white font-display">Pesanan Berhasil Dibuat!</h4>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Terima kasih, MOA! Paket merchandise resmi TXT akan segera dikirimkan ke alamat Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCheckoutDone(false)}
                    className="mt-4 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                  >
                    Beli Produk Lain
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-neutral-300">Penerima</span>
                      <button
                        type="button"
                        onClick={() => setIsEditRecipientOpen(true)}
                        className="text-xs text-[#F8138D] hover:underline cursor-pointer"
                      >
                        Ubah di profil
                      </button>
                    </div>
                    <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-xs leading-relaxed">
                      <div className="font-semibold text-white">{user?.name || 'Aulia Rahma'}</div>
                      <div className="text-neutral-400">{user?.email || 'aulia@email.com'}</div>
                      <div className="text-neutral-400 font-mono">{user?.phone || '+62 812 3456 7890'}</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-neutral-300">Alamat pengiriman</span>
                      <button
                        type="button"
                        onClick={openAddModal}
                        className="text-xs text-[#F8138D] hover:underline cursor-pointer"
                      >
                        Tambah alamat
                      </button>
                    </div>
                    {selectedAddress ? (
                      <div className="border border-white/15 bg-black/50 rounded-xl p-3.5 text-xs flex gap-2.5">
                        <MapPin className="w-4 h-4 text-[#F8138D] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{selectedAddress.label}</span>
                            {selectedAddress.isDefault && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F8138D]/20 text-[#f570b7] border border-[#F8138D]/30 font-semibold">
                                Utama
                              </span>
                            )}
                          </div>
                          <div className="text-neutral-300 text-[11px] mt-1 leading-relaxed">
                            {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-white/20 rounded-xl p-4 text-center">
                        <p className="text-xs text-neutral-400 mb-2">Belum ada alamat pengiriman.</p>
                        <button
                          type="button"
                          onClick={openAddModal}
                          className="px-3 py-1.5 rounded-lg bg-[#F8138D] text-white text-xs font-semibold"
                        >
                          Tambah Alamat Sekarang
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-3 space-y-2 text-xs">
                    {hasCartItems ? (
                      items.map((it) => (
                        <div key={it.id} className="flex justify-between text-neutral-300">
                          <span className="truncate max-w-[200px]">
                            {it.name} x{it.quantity}
                          </span>
                          <span className="font-mono text-white">
                            Rp {(Math.round(it.price * 16000) * it.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between text-neutral-300">
                        <span>Lightstick Official TXT v2 x1</span>
                        <span className="font-mono text-white">Rp 350.000</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-400">
                      <span>Ongkir (Pengiriman Cepat)</span>
                      <span className="font-mono text-neutral-200">Rp {shippingFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-white/10">
                      <span>Total Pembayaran</span>
                      <span className="font-mono text-[#f570b7]">
                        Rp {grandTotalRupiah.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={isCheckingOut || !selectedAddress}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F8138D] via-[#f570b7] to-[#F8138D] text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(248,19,141,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memproses Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <span>Bayar sekarang</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-neutral-900 border border-white/15 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white font-display">
                {editingAddressId ? 'Ubah Alamat Pengiriman' : 'Tambah Alamat Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 mb-1">Label Alamat</label>
                  <input
                    type="text"
                    value={modalLabel}
                    onChange={(e) => setModalLabel(e.target.value)}
                    placeholder="Rumah / Kantor / Kos"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    value={modalRecipient}
                    onChange={(e) => setModalRecipient(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">No. Handphone</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-black/40 border border-white/15 rounded-xl text-neutral-300 font-mono text-xs">
                    +62
                  </div>
                  <input
                    type="text"
                    value={modalPhone}
                    onChange={(e) => setModalPhone(e.target.value)}
                    placeholder="812 3456 7890"
                    className="flex-1 bg-black/50 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">Alamat Lengkap</label>
                <textarea
                  value={modalStreet}
                  onChange={(e) => setModalStreet(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                  rows={2}
                  className="w-full bg-black/50 border border-white/15 focus:border-[#F8138D] rounded-xl p-3 text-white placeholder:text-neutral-600 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-300 mb-1">Kota/Kabupaten</label>
                  <input
                    type="text"
                    value={modalCity}
                    onChange={(e) => setModalCity(e.target.value)}
                    placeholder="Bandung"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-300 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={modalProvince}
                    onChange={(e) => setModalProvince(e.target.value)}
                    placeholder="Jawa Barat"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-300 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={modalPostalCode}
                    onChange={(e) => setModalPostalCode(e.target.value)}
                    placeholder="40123"
                    className="w-full bg-black/50 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={modalIsDefault}
                  onChange={(e) => setModalIsDefault(e.target.checked)}
                  className="accent-[#F8138D] w-3.5 h-3.5"
                />
                <span className="text-neutral-300 text-xs">Jadikan alamat pengiriman utama</span>
              </label>

              <div className="flex gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] text-white font-bold shadow-lg"
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditRecipientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-neutral-900 border border-white/15 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white font-display">Ubah Data Penerima</h3>
              <button
                type="button"
                onClick={() => setIsEditRecipientOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipient} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">Email</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 mb-1">No. Handphone (+62)</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditRecipientOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#F8138D] hover:bg-[#f570b7] text-white font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
