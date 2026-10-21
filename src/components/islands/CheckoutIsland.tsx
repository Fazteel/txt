import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  currentUser,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setSelectedAddress,
  type UserAddress
} from '../../stores/authStore';
import {
  cartItems,
  cartSubtotal,
  updateQuantity,
  removeFromCart,
  clearCart,
  addToCart
} from '../../stores/cartStore';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Package,
  ShoppingBag,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Truck,
  Copy,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentOption {
  id: string;
  name: string;
  category: 'qris' | 'va' | 'ewallet' | 'card' | 'global';
  badge?: string;
  description: string;
  accountNumber?: string;
}

const PAYMENT_METHODS: PaymentOption[] = [
  {
    id: 'qris',
    name: 'QRIS (Semua Pembayaran)',
    category: 'qris',
    badge: 'Instan & Otomatis',
    description: 'GoPay, OVO, ShopeePay, DANA, BCA Mobile, Livin, dll.',
  },
  {
    id: 'va_bca',
    name: 'BCA Virtual Account',
    category: 'va',
    badge: 'Verifikasi Otomatis',
    description: 'Transfer via BCA Mobile, KlikBCA, atau ATM BCA',
    accountNumber: '8910 8123 4567 8901',
  },
  {
    id: 'va_mandiri',
    name: 'Mandiri Virtual Account',
    category: 'va',
    badge: 'Verifikasi Otomatis',
    description: 'Transfer via Livin by Mandiri atau ATM Mandiri',
    accountNumber: '8870 8123 4567 8902',
  },
  {
    id: 'va_bni',
    name: 'BNI Virtual Account',
    category: 'va',
    badge: 'Verifikasi Otomatis',
    description: 'Transfer via BNI Mobile Banking atau ATM BNI',
    accountNumber: '8277 8123 4567 8903',
  },
  {
    id: 'ewallet_gopay',
    name: 'GoPay / GoPay Later',
    category: 'ewallet',
    description: 'Bayar langsung lewat aplikasi Gojek',
  },
  {
    id: 'ewallet_shopeepay',
    name: 'ShopeePay',
    category: 'ewallet',
    description: 'Notifikasi otomatis di aplikasi Shopee',
  },
  {
    id: 'card_credit',
    name: 'Kartu Kredit / Debit Online',
    category: 'card',
    badge: 'Visa / Mastercard / JCB',
    description: 'Pembayaran aman 3D-Secure 256-bit SSL',
  },
  {
    id: 'global_weverse',
    name: 'Weverse Pay / PayPal Global',
    category: 'global',
    description: 'Untuk MOA internasional dan Weverse Shop direct checkout',
  },
];

export default function CheckoutIsland() {
  const user = useStore(currentUser);
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);

  const [selectedPayment, setSelectedPayment] = useState<string>('qris');
  const [shippingOption, setShippingOption] = useState<'reguler' | 'express'>('reguler');
  const [orderNotes, setOrderNotes] = useState<string>('');

  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [formLabel, setFormLabel] = useState<string>('Rumah');
  const [formRecipient, setFormRecipient] = useState<string>(user?.name || 'Aulia Rahma');
  const [formPhone, setFormPhone] = useState<string>(user?.phone || '+62 812 3456 7890');
  const [formStreet, setFormStreet] = useState<string>('');
  const [formCity, setFormCity] = useState<string>('Bandung');
  const [formProvince, setFormProvince] = useState<string>('Jawa Barat');
  const [formPostalCode, setFormPostalCode] = useState<string>('40123');
  const [formIsDefault, setFormIsDefault] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [orderSummaryData, setOrderSummaryData] = useState<{
    orderId: string;
    date: string;
    items: typeof items;
    totalRupiah: number;
    payment: PaymentOption;
    address: UserAddress;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const addresses: UserAddress[] = user?.addresses && user.addresses.length > 0
    ? user.addresses
    : [
        {
          id: 'addr_default_aulia',
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

  const subtotalRupiah = Math.round(subtotal * 16000);
  const shippingFee = subtotalRupiah > 600000 ? 0 : shippingOption === 'express' ? 35000 : 20000;
  const platformFee = 1000;
  const totalRupiah = subtotalRupiah + shippingFee + platformFee;

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setFormLabel('Rumah');
    setFormRecipient(user?.name || '');
    setFormPhone(user?.phone || '+62 812 3456 7890');
    setFormStreet('');
    setFormCity('Bandung');
    setFormProvince('Jawa Barat');
    setFormPostalCode('40123');
    setFormIsDefault(addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: UserAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setFormLabel(addr.label);
    setFormRecipient(addr.recipientName);
    setFormPhone(addr.phone);
    setFormStreet(addr.street);
    setFormCity(addr.city);
    setFormProvince(addr.province);
    setFormPostalCode(addr.postalCode);
    setFormIsDefault(addr.isDefault);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Hapus alamat ini?')) {
      deleteUserAddress(id);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStreet.trim() || !formRecipient.trim()) {
      alert('Mohon lengkapi nama penerima dan alamat.');
      return;
    }

    const formattedPhone = formPhone.trim().startsWith('+62')
      ? formPhone.trim()
      : `+62 ${formPhone.trim().replace(/^0/, '')}`;

    if (editingAddressId) {
      updateUserAddress(editingAddressId, {
        label: formLabel,
        recipientName: formRecipient.trim(),
        phone: formattedPhone,
        street: formStreet.trim(),
        city: formCity.trim(),
        province: formProvince.trim(),
        postalCode: formPostalCode.trim(),
        isDefault: formIsDefault,
      });
      setSelectedAddress(editingAddressId);
    } else {
      const created = addUserAddress({
        label: formLabel,
        recipientName: formRecipient.trim(),
        phone: formattedPhone,
        street: formStreet.trim(),
        city: formCity.trim(),
        province: formProvince.trim(),
        postalCode: formPostalCode.trim(),
        isDefault: formIsDefault,
      });
      setSelectedAddress(created.id);
    }

    setIsAddressModalOpen(false);
  };

  const handleQuickAddSample = () => {
    addToCart({
      id: 'txt-act-promise-album',
      name: 'The Name Chapter: PROMISE (Special Edition)',
      price: 32,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      quantity: 1,
      size: 'Deluxe CD + Photobook',
      color: 'Promise Pink',
    });
  };

  const handleConfirmPayment = () => {
    if (items.length === 0) {
      alert('Keranjang belanja Anda masih kosong.');
      return;
    }
    if (!selectedAddress) {
      alert('Silakan pilih atau tambahkan alamat pengiriman terlebih dahulu.');
      return;
    }

    setIsProcessing(true);

    const paymentObj = PAYMENT_METHODS.find((p) => p.id === selectedPayment) || PAYMENT_METHODS[0];
    const randomOrderId = `TXT-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const snapshot = {
      orderId: randomOrderId,
      date: formattedDate,
      items: [...items],
      totalRupiah: totalRupiah,
      payment: paymentObj,
      address: selectedAddress,
    };

    setTimeout(() => {
      setIsProcessing(false);
      setOrderSummaryData(snapshot);
      setOrderSuccess(true);
      clearCart();

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#F8138D', '#f570b7', '#00f2fe', '#ffffff', '#ffd700'],
        });
      } catch {}
    }, 1100);
  };

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (orderSuccess && orderSummaryData) {
    const { orderId, date, items: orderItems, totalRupiah: finalTotal, payment, address } = orderSummaryData;

    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#F8138D]/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex p-4 rounded-3xl bg-[#F8138D]/15 border border-[#F8138D]/30 text-[#F8138D] mb-4 shadow-[0_0_25px_rgba(248,19,141,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-wider uppercase mb-2">
              Pesanan Berhasil Dibuat!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300">
              Terima kasih, MOA! Pesanan merchandise resmi TOMORROW X TOGETHER Anda telah kami terima dan siap diproses.
            </p>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-2xl p-5 sm:p-6 mb-6 divide-y divide-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#F8138D] uppercase font-bold block mb-0.5">
                  Nomor Transaksi
                </span>
                <span className="text-base font-bold font-mono text-white">{orderId}</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block mb-0.5">
                  Waktu Transaksi
                </span>
                <span className="text-xs text-neutral-300">{date}</span>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold block mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F8138D]" />
                  Alamat Pengiriman
                </span>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs space-y-1">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{address.recipientName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F8138D]/20 text-[#f570b7]">
                      {address.label}
                    </span>
                  </div>
                  <div className="text-neutral-400 font-mono">{address.phone}</div>
                  <div className="text-neutral-300 leading-relaxed pt-1">
                    {address.street}, {address.city}, {address.province} {address.postalCode}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold block mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#F8138D]" />
                  Metode Pembayaran
                </span>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs space-y-2">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{payment.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400">● Menunggu Pembayaran</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">{payment.description}</p>

                  {payment.accountNumber ? (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between bg-black/40 p-2 rounded-lg">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-neutral-500 block">Nomor Virtual Account</span>
                        <span className="font-mono text-sm font-bold text-[#f570b7] tracking-wider">
                          {payment.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(payment.accountNumber!)}
                        className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title="Salin Nomor VA"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : payment.category === 'qris' ? (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-3 bg-black/40 p-2.5 rounded-lg">
                      <div className="w-12 h-12 bg-white p-1 rounded-md flex items-center justify-center shrink-0">
                        <QrCode className="w-10 h-10 text-black" />
                      </div>
                      <div className="text-[11px] text-neutral-300">
                        Scan QRIS dengan aplikasi e-wallet atau m-banking Anda untuk menyelesaikan pembayaran.
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold block mb-3">
                Barang yang Dibeli ({orderItems.reduce((s, i) => s + i.quantity, 0)} item)
              </span>
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size || ''}-${item.color || ''}`}
                    className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg bg-black/50 border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                        {item.size && <span>Ukuran: {item.size}</span>}
                        {item.color && <span>• {item.color}</span>}
                        <span>• Jumlah: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold text-white font-mono">
                        Rp {(Math.round(item.price * 16000) * item.quantity).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        ${(item.price * item.quantity).toFixed(2)} USD
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-sm sm:text-base font-bold text-white">
              <span>Total Pembayaran</span>
              <span className="text-xl sm:text-2xl font-mono text-[#f570b7]">
                Rp {finalTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(248,19,141,0.4)] text-center cursor-pointer"
            >
              Kembali ke Beranda
            </a>
            <a
              href="/store"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all text-center cursor-pointer"
            >
              Lihat Official Merch Lainnya
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 relative">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F8138D] uppercase tracking-wider font-semibold mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Tomorrow X Together Official Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight uppercase">
            Ringkasan Pembelian & Checkout
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="text-[#F8138D] font-semibold">1. Keranjang</span>
          <ChevronRight className="w-3 h-3 text-neutral-600" />
          <span className="text-white font-semibold">2. Ringkasan & Alamat</span>
          <ChevronRight className="w-3 h-3 text-neutral-600" />
          <span>3. Selesai</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-[#F8138D]" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-display">
                  Barang yang Dibeli ({items.reduce((s, i) => s + i.quantity, 0)})
                </h2>
              </div>
              <a
                href="/store"
                className="text-xs text-[#F8138D] hover:underline flex items-center gap-1 font-semibold"
              >
                + Tambah Barang
              </a>
            </div>

            {items.length === 0 ? (
              <div className="py-10 text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto stroke-[1.5]" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Keranjang belanja Anda masih kosong</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Pilih merchandise official TXT seperti album, lightstick, atau apparel untuk melanjutkan transaksi.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleQuickAddSample}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(248,19,141,0.4)] cursor-pointer"
                  >
                    + Masukkan Album Sample
                  </button>
                  <a
                    href="/store"
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Buka Official Store
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.size || ''}-${item.color || ''}`}
                    className="flex gap-3.5 p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-black/60 border border-white/10 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <a
                        href={`/store/${item.id}`}
                        className="text-xs sm:text-sm font-bold text-white hover:text-[#F8138D] transition-colors line-clamp-1"
                      >
                        {item.name}
                      </a>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 mt-1">
                        {item.size && (
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            {item.color}
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-[#F8138D] font-mono mt-1.5">
                        Rp {(Math.round(item.price * 16000)).toLocaleString('id-ID')}
                        <span className="text-[10px] text-neutral-500 font-normal ml-1.5 font-sans">
                          (${item.price.toFixed(2)} USD / item)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center border border-white/15 bg-black/60 rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                          className="px-2 py-1 text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-xs font-bold text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="px-2 py-1 text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        className="p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Hapus barang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-[#F8138D]" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-display">
                  Pemilihan Alamat Pengiriman
                </h2>
              </div>
              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] hover:brightness-110 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(248,19,141,0.3)] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Alamat Baru</span>
              </button>
            </div>

            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Pilih alamat tujuan pengiriman merchandise Anda atau buat alamat baru di bawah ini.
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
                        ? 'bg-neutral-800/90 border-[#F8138D] shadow-[0_0_18px_rgba(248,19,141,0.25)]'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white font-display uppercase tracking-wide">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F8138D]/20 text-[#f570b7] border border-[#F8138D]/30 font-semibold">
                            Utama
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Dipilih
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditAddress(addr, e)}
                          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit Alamat"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                            title="Hapus Alamat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-neutral-200">
                        {addr.recipientName} <span className="text-neutral-400 font-mono font-normal">({addr.phone})</span>
                      </div>
                      <div className="text-neutral-400 leading-relaxed text-[11px] pt-0.5">
                        {addr.street}, {addr.city}, {addr.province} {addr.postalCode}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-white/10 mb-4">
              <CreditCard className="w-5 h-5 text-[#F8138D]" />
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-display">
                Metode Pembayaran
              </h2>
            </div>

            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Pilih metode pembayaran yang ingin Anda gunakan untuk menyelesaikan transaksi ini.
            </p>

            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = selectedPayment === pm.id;
                return (
                  <div
                    key={pm.id}
                    onClick={() => setSelectedPayment(pm.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-neutral-800/90 border-[#F8138D] shadow-[0_0_16px_rgba(248,19,141,0.2)]'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#F8138D]/20 border-[#F8138D]/40 text-[#f570b7]'
                          : 'bg-white/5 border-white/10 text-neutral-400'
                      }`}>
                        {pm.category === 'qris' && <QrCode className="w-4 h-4" />}
                        {pm.category === 'va' && <Building2 className="w-4 h-4" />}
                        {pm.category === 'ewallet' && <Wallet className="w-4 h-4" />}
                        {pm.category === 'card' && <CreditCard className="w-4 h-4" />}
                        {pm.category === 'global' && <Sparkles className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-white truncate">{pm.name}</span>
                          {pm.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                              {pm.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">{pm.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-[#F8138D] bg-[#F8138D]'
                          : 'border-white/30 bg-transparent'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                <Package className="w-5 h-5 text-[#F8138D]" />
                Ringkasan Belanja
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 tracking-wider">
                ● 100% Weverse Official
              </span>
            </div>

            <div className="mb-5 space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">Opsi Kurir Pengiriman</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShippingOption('reguler')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    shippingOption === 'reguler'
                      ? 'bg-neutral-800 border-[#F8138D] text-white shadow-[0_0_10px_rgba(248,19,141,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">Reguler (2-3 hari)</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {subtotalRupiah > 600000 ? 'Gratis Ongkir' : 'Rp 20.000'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setShippingOption('express')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    shippingOption === 'express'
                      ? 'bg-neutral-800 border-[#F8138D] text-white shadow-[0_0_10px_rgba(248,19,141,0.2)]'
                      : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">Next Day (1 hari)</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {subtotalRupiah > 600000 ? 'Rp 15.000' : 'Rp 35.000'}
                  </div>
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Catatan Tambahan (Opsional)</label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Contoh: Titipkan di satpam, bungkus bubble tebal"
                className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>Subtotal Produk ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
                <span className="font-mono text-white font-semibold">
                  Rp {subtotalRupiah.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-neutral-500" />
                  Biaya Pengiriman
                </span>
                <span className="font-mono text-neutral-200">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold">GRATIS</span>
                  ) : (
                    `Rp ${shippingFee.toLocaleString('id-ID')}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-neutral-400">
                <span>Biaya Layanan & Asuransi</span>
                <span className="font-mono text-neutral-200">
                  Rp {platformFee.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-white pt-3 border-t border-white/10">
                <div>
                  <div>Total Tagihan</div>
                  <div className="text-[10px] text-neutral-500 font-normal">
                    ≈ ${(totalRupiah / 16000).toFixed(2)} USD
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono text-[#f570b7]">
                    Rp {totalRupiah.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={isProcessing || items.length === 0 || !selectedAddress}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-[#F8138D] via-[#f570b7] to-[#F8138D] hover:brightness-110 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(248,19,141,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses Pembayaran...</span>
                </>
              ) : (
                <>
                  <span>Bayar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-neutral-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F8138D]" />
              <span>Garansi 100% Produk Original BigHit Music & Weverse</span>
            </div>
          </div>
        </div>
      </div>

      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-neutral-900 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#F8138D]" />
                <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">
                  {editingAddressId ? 'Edit Alamat Pengiriman' : 'Tambah Alamat Pengiriman Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Label Alamat</label>
                  <input
                    type="text"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="Rumah, Kantor, Kos"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    value={formRecipient}
                    onChange={(e) => setFormRecipient(e.target.value)}
                    placeholder="Aulia Rahma"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+62 812 3456 7890"
                  className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Alamat Lengkap</label>
                <textarea
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  placeholder="Nama Jalan, Nomor Rumah, RT/RW, Patokan"
                  rows={2}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl p-3 text-white placeholder:text-neutral-600 focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Kota</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Bandung"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-2.5 py-2 text-white placeholder:text-neutral-600 focus:outline-none text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
                    placeholder="Jawa Barat"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-2.5 py-2 text-white placeholder:text-neutral-600 focus:outline-none text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={formPostalCode}
                    onChange={(e) => setFormPostalCode(e.target.value)}
                    placeholder="40123"
                    className="w-full bg-black/60 border border-white/15 focus:border-[#F8138D] rounded-xl px-2.5 py-2 text-white placeholder:text-neutral-600 focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="rounded border-white/20 text-[#F8138D] focus:ring-[#F8138D] bg-black/60"
                  />
                  <span className="text-neutral-300 text-xs">Jadikan alamat pengiriman utama</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  Simpan & Gunakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
