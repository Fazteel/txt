import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Check,
  Copy,
  Download,
  Clock,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Wallet,
  RefreshCw,
  Sparkles,
  Truck,
  Receipt,
  Package,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderItem {
  id: string;
  name: string;
  subtitle: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderData {
  orderId: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  platformFee: number;
  total: number;
  paymentMethod: 'qris' | 'va_bca' | 'va_mandiri' | 'va_bni' | 'ewallet_gopay';
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  orderNotes?: string;
}

const DEFAULT_REFERENCE_ORDER: OrderData = {
  orderId: '1877HI98ARS',
  date: '21 Oktober 2026, 14:00 WIB',
  subtotal: 160000,
  shippingFee: 20000,
  platformFee: 1000,
  total: 181000,
  paymentMethod: 'qris',
  customerName: 'Faril & Mine',
  customerPhone: '+62 812 3456 7890',
  shippingAddress: 'Jl. Melpomene No. 18, Bandung, Jawa Barat 40123',
  items: [
    {
      id: 'item-faril',
      name: 'Faril',
      subtitle: 'Muse of Melpomene',
      quantity: 1,
      price: 80000,
    },
    {
      id: 'item-mine',
      name: 'Mine',
      subtitle: 'Muse of Terpsichore',
      quantity: 1,
      price: 80000,
    },
  ],
};

const QR_MATRIX = [
  [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,0,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
  [1,1,0,1,0,1,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1],
  [0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,0],
  [1,0,1,1,0,1,1,0,1,1,1,0,1,0,0,1,1,0,1,1,0],
  [0,1,0,0,1,0,1,1,0,1,1,0,1,1,0,0,1,0,0,1,1],
  [1,1,1,0,0,1,0,0,1,0,0,1,0,0,1,1,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,1,0,1,1,0,1,1,0,1,0,1,1,1],
  [1,1,1,1,1,1,1,0,1,1,0,0,1,0,0,1,0,1,0,0,1],
  [1,0,0,0,0,0,1,0,0,1,1,1,0,1,1,0,1,1,0,1,0],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,1],
  [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,0,1,0],
  [1,0,1,1,1,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1],
  [1,0,0,0,0,0,1,0,1,0,1,1,0,1,1,0,1,1,1,0,0],
  [1,1,1,1,1,1,1,0,0,1,0,1,1,0,1,0,0,1,1,1,1],
];

export default function PaymentIsland() {
  const [order, setOrder] = useState<OrderData>(DEFAULT_REFERENCE_ORDER);
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'va_bca' | 'va_mandiri' | 'va_bni' | 'ewallet_gopay'>('qris');
  const [timeLeft, setTimeLeft] = useState<number>(899);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [activeSource, setActiveSource] = useState<'reference' | 'cart'>('reference');
  const qrSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlOrderId = searchParams.get('orderId');
      const urlMethod = searchParams.get('method');

      if (urlMethod && ['qris', 'va_bca', 'va_mandiri', 'va_bni', 'ewallet_gopay'].includes(urlMethod)) {
        setSelectedMethod(urlMethod as any);
      }

      const stored = sessionStorage.getItem('txt_active_payment') || localStorage.getItem('txt_active_payment');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.items && parsed.items.length > 0) {
          const calcSubtotal = typeof parsed.subtotalRupiah === 'number'
            ? parsed.subtotalRupiah
            : parsed.items.reduce((s: number, i: any) => s + (Math.round((i.price || 0) * 16000) * (i.quantity || 1)), 0);
          const calcShipping = typeof parsed.shippingFee === 'number'
            ? parsed.shippingFee
            : (calcSubtotal > 600000 ? 0 : 20000);
          const calcPlatform = typeof parsed.platformFee === 'number'
            ? parsed.platformFee
            : 1000;
          const calcTotal = typeof parsed.totalRupiah === 'number'
            ? parsed.totalRupiah
            : (calcSubtotal + calcShipping + calcPlatform);

          const adaptedOrder: OrderData = {
            orderId: parsed.orderId || urlOrderId || '1877HI98ARS',
            date: parsed.date || new Date().toLocaleString('id-ID'),
            subtotal: calcSubtotal,
            shippingFee: calcShipping,
            platformFee: calcPlatform,
            total: calcTotal,
            paymentMethod: (parsed.payment?.id as any) || 'qris',
            customerName: parsed.address?.recipientName || 'Aulia Rahma',
            customerPhone: parsed.address?.phone || '+62 812 3456 7890',
            shippingAddress: parsed.address
              ? `${parsed.address.street}, ${parsed.address.city}, ${parsed.address.province} ${parsed.address.postalCode}`
              : undefined,
            orderNotes: parsed.orderNotes,
            items: parsed.items.map((i: any, idx: number) => ({
              id: `${i.id || 'item'}-${idx}`,
              name: i.name,
              subtitle: [i.size, i.color].filter(Boolean).join(' • ') || 'Official Merch',
              quantity: i.quantity || 1,
              price: Math.round((i.price || 5) * 16000),
              image: i.image,
            })),
          };

          if (urlOrderId && urlOrderId !== '1877HI98ARS') {
            setOrder(adaptedOrder);
            setActiveSource('cart');
            if (adaptedOrder.paymentMethod) {
              setSelectedMethod(adaptedOrder.paymentMethod);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isPaid) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaid]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSimulatePayment = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setIsPaid(true);
      try {
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.55 },
          colors: ['#F8138D', '#f570b7', '#00f2fe', '#ffffff', '#ffd700'],
        });
      } catch {}
    }, 1200);
  };

  const handleDownloadQR = () => {
    if (!qrSvgRef.current) return;
    try {
      const svgElement = qrSvgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, 600, 600);
          context.drawImage(image, 50, 50, 500, 500);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `QRIS-Payment-${order.orderId}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    } catch {
      alert('QR Code siap di-screenshot atau scan langsung dari layar.');
    }
  };

  const switchDataSource = (source: 'reference' | 'cart') => {
    setActiveSource(source);
    if (source === 'reference') {
      setOrder(DEFAULT_REFERENCE_ORDER);
      setSelectedMethod('qris');
    } else {
      const stored = sessionStorage.getItem('txt_active_payment') || localStorage.getItem('txt_active_payment');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const calcSubtotal = typeof parsed.subtotalRupiah === 'number'
            ? parsed.subtotalRupiah
            : parsed.items?.reduce((s: number, i: any) => s + (Math.round((i.price || 0) * 16000) * (i.quantity || 1)), 0) || 160000;
          const calcShipping = typeof parsed.shippingFee === 'number'
            ? parsed.shippingFee
            : (calcSubtotal > 600000 ? 0 : 20000);
          const calcPlatform = typeof parsed.platformFee === 'number'
            ? parsed.platformFee
            : 1000;
          const calcTotal = typeof parsed.totalRupiah === 'number'
            ? parsed.totalRupiah
            : (calcSubtotal + calcShipping + calcPlatform);

          setOrder({
            orderId: parsed.orderId || 'TXT-982134',
            date: parsed.date || new Date().toLocaleString('id-ID'),
            subtotal: calcSubtotal,
            shippingFee: calcShipping,
            platformFee: calcPlatform,
            total: calcTotal,
            paymentMethod: (['qris', 'va_bca', 'va_mandiri', 'va_bni', 'ewallet_gopay'].includes(parsed.payment?.id)
              ? parsed.payment.id
              : 'qris') as any,
            customerName: parsed.address?.recipientName || 'Aulia Rahma',
            customerPhone: parsed.address?.phone || '+62 812 3456 7890',
            shippingAddress: parsed.address
              ? `${parsed.address.street}, ${parsed.address.city}, ${parsed.address.province} ${parsed.address.postalCode}`
              : undefined,
            orderNotes: parsed.orderNotes,
            items: (parsed.items || []).map((i: any, idx: number) => ({
              id: `${i.id || 'item'}-${idx}`,
              name: i.name,
              subtitle: [i.size, i.color].filter(Boolean).join(' • ') || 'Official Merch',
              quantity: i.quantity || 1,
              price: Math.round((i.price || 5) * 16000),
              image: i.image,
            })),
          });
          if (parsed.payment?.id && ['qris', 'va_bca', 'va_mandiri', 'va_bni', 'ewallet_gopay'].includes(parsed.payment.id)) {
            setSelectedMethod(parsed.payment.id as any);
          }
        } catch {
          setOrder(DEFAULT_REFERENCE_ORDER);
        }
      } else {
        alert('Belum ada pesanan aktif dari keranjang. Tetap menampilkan data referensi.');
        setActiveSource('reference');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#F8138D] selection:text-white pb-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-[500px] h-[350px] bg-[#F8138D]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[300px] bg-[#f570b7]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a
            href="/checkout"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#f570b7]" />
            <span>Kembali ke Checkout</span>
          </a>

          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-widest text-[#F8138D] uppercase font-display drop-shadow-[0_0_12px_rgba(248,19,141,0.6)]">
              + × +
            </span>
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-widest hidden sm:inline">
              Official Payment
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Secured</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-2 relative z-10">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#F8138D]/40 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-4 w-full flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => switchDataSource('reference')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
              activeSource === 'reference'
                ? 'bg-gradient-to-r from-[#F8138D] to-[#f570b7] text-white shadow-[0_0_15px_rgba(248,19,141,0.4)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Mode Referensi Gambar
          </button>
          <button
            type="button"
            onClick={() => switchDataSource('cart')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
              activeSource === 'cart'
                ? 'bg-gradient-to-r from-[#F8138D] to-[#f570b7] text-white shadow-[0_0_15px_rgba(248,19,141,0.4)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Pesanan Keranjang Saya
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedMethod('qris')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              selectedMethod === 'qris'
                ? 'bg-[#F8138D]/20 text-[#f570b7] border-[#F8138D]/60 shadow-[0_0_15px_rgba(248,19,141,0.3)]'
                : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            QRIS
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('va_bca')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              selectedMethod === 'va_bca'
                ? 'bg-[#F8138D]/20 text-[#f570b7] border-[#F8138D]/60 shadow-[0_0_15px_rgba(248,19,141,0.3)]'
                : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            BCA VA
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('ewallet_gopay')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              selectedMethod === 'ewallet_gopay'
                ? 'bg-[#F8138D]/20 text-[#f570b7] border-[#F8138D]/60 shadow-[0_0_15px_rgba(248,19,141,0.3)]'
                : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            GoPay
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-4xl bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#F8138D]/15 rounded-full blur-[100px] pointer-events-none" />

          {isPaid ? (
            <div className="text-center py-8 sm:py-12 max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-400 relative z-10">
              <div className="w-20 h-20 bg-[#F8138D]/20 text-[#f570b7] rounded-3xl flex items-center justify-center mx-auto border border-[#F8138D]/40 shadow-[0_0_30px_rgba(248,19,141,0.4)]">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <span className="text-[11px] font-mono tracking-widest text-[#f570b7] uppercase font-bold block mb-1">
                  Transaksi Berhasil
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide">
                  Pembayaran Diterima!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                  Terima kasih, MOA! Pembayaran untuk pesanan{' '}
                  <span className="font-mono font-bold text-[#f570b7]">{order.orderId}</span> sebesar{' '}
                  <span className="font-bold text-white font-mono">Rp {order.total.toLocaleString('id-ID')}</span> telah berhasil diverifikasi.
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-2xl p-4 sm:p-5 text-left text-xs space-y-3">
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-neutral-400">Nomor Pesanan</span>
                  <span className="font-mono font-bold text-white">{order.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-neutral-400">Subtotal Produk</span>
                  <span className="font-mono text-white">Rp {order.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-neutral-400">Ongkos Kirim</span>
                  <span className="font-mono text-white">
                    {order.shippingFee === 0 ? 'GRATIS' : `Rp ${order.shippingFee.toLocaleString('id-ID')}`}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-neutral-400">Biaya Layanan & Aplikasi</span>
                  <span className="font-mono text-white">Rp {order.platformFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-neutral-400">Total Dibayar</span>
                  <span className="font-mono font-bold text-[#f570b7]">Rp {order.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2.5">
                  <span className="text-neutral-400">Metode Pembayaran</span>
                  <span className="font-bold text-[#f570b7] uppercase">{selectedMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Status Transaksi</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                    <Check className="w-4 h-4" /> Lunas / Terverifikasi
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href="/store"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all text-center cursor-pointer shadow-[0_0_20px_rgba(248,19,141,0.4)]"
                >
                  Belanja Lagi di Store
                </a>
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all text-center cursor-pointer"
                >
                  Lihat QR Kembali
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
              <div className="md:col-span-6 flex flex-col justify-between space-y-5">
                <div>
                  <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-tight">
                    Ringkasan Pembayaran
                  </h1>
                  <div className="text-xs sm:text-sm font-bold text-[#f570b7] mt-1 font-mono tracking-wide">
                    Order ID: {order.orderId}
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5 text-xs">
                    <MapPin className="w-4 h-4 text-[#F8138D] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
                        <span className="uppercase font-mono tracking-wider">Tujuan Pengiriman</span>
                        {order.customerPhone && (
                          <span className="font-mono text-neutral-300">{order.customerPhone}</span>
                        )}
                      </div>
                      <div className="font-semibold text-white truncate">{order.customerName}</div>
                      <div className="text-[11px] text-neutral-400 line-clamp-1">
                        {order.shippingAddress}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                    <span>Rincian Barang</span>
                    <span>{order.items.reduce((s, i) => s + i.quantity, 0)} item</span>
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-black/50 border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#f570b7]">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-white truncate">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-neutral-400 truncate">
                              {item.subtitle}
                            </div>
                            <div className="text-[10px] text-[#f570b7] font-semibold font-mono">
                              {item.quantity}x • Rp {item.price.toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-bold text-white font-mono">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold mb-1">
                    <span>Rincian Biaya</span>
                    <span>Tarif Resmi</span>
                  </div>

                  <div className="flex justify-between text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Subtotal Produk ({order.items.reduce((s, i) => s + i.quantity, 0)} item)</span>
                    </span>
                    <span className="font-mono text-white font-semibold">
                      Rp {order.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Ongkos Kirim (Reguler)</span>
                    </span>
                    <span className="font-mono">
                      {order.shippingFee === 0 ? (
                        <span className="text-emerald-400 font-bold">GRATIS</span>
                      ) : (
                        <span className="text-neutral-200">Rp {order.shippingFee.toLocaleString('id-ID')}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Biaya Layanan & Aplikasi</span>
                    </span>
                    <span className="font-mono text-neutral-200">
                      Rp {order.platformFee.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {order.orderNotes && (
                    <div className="pt-1.5 text-[11px] text-neutral-400 bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-neutral-500 font-mono uppercase text-[9px] block">Catatan Pesanan:</span>
                      <span className="italic text-neutral-300">"{order.orderNotes}"</span>
                    </div>
                  )}
                </div>

                <div className="bg-black/60 border border-[#F8138D]/30 rounded-2xl p-4 sm:p-5 mt-2 space-y-3 relative overflow-hidden shadow-[0_0_20px_rgba(248,19,141,0.15)]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8138D]/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase font-mono tracking-wider">
                        Total Tagihan
                      </span>
                      <span className="text-xl sm:text-2xl font-bold font-mono text-[#f570b7]">
                        Rp {order.total.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.total.toString())}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs"
                      title="Salin Nominal"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300 relative z-10">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#f570b7]" />
                      <span>Selesaikan dalam</span>
                    </div>
                    <span className="font-mono font-bold text-[#f570b7] bg-[#F8138D]/20 border border-[#F8138D]/40 px-2.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(248,19,141,0.3)]">
                      {formatTimer(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block md:col-span-1 self-stretch flex justify-center py-2">
                <div className="w-[1px] h-full bg-white/10" />
              </div>

              <div className="md:col-span-5 flex flex-col items-center justify-center space-y-5 pt-2 md:pt-0">
                {selectedMethod === 'qris' ? (
                  <>
                    <div className="w-full flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-display uppercase tracking-widest text-white">
                          QRIS
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          NMID: ID1020038192839
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                        ● Siap di-scan
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl shadow-[0_0_30px_rgba(248,19,141,0.25)] border-2 border-white/30 relative flex flex-col items-center justify-center">
                      <svg
                        ref={qrSvgRef}
                        viewBox="0 0 21 21"
                        className="w-56 h-56 sm:w-64 sm:h-64 shape-rendering-crisp"
                        fill="currentColor"
                      >
                        {QR_MATRIX.map((row, rIdx) =>
                          row.map((cell, cIdx) =>
                            cell === 1 ? (
                              <rect
                                key={`${rIdx}-${cIdx}`}
                                x={cIdx}
                                y={rIdx}
                                width="1"
                                height="1"
                                fill="#000000"
                              />
                            ) : null
                          )
                        )}
                      </svg>
                    </div>

                    <div className="w-full space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5 w-full">
                        <button
                          type="button"
                          onClick={handleDownloadQR}
                          className="w-full py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#f570b7]" />
                          <span>Unduh QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSimulatePayment}
                          disabled={isChecking}
                          className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_20px_rgba(248,19,141,0.4)] disabled:opacity-60"
                        >
                          {isChecking ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Mengecek...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Saya Sudah Bayar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-center text-neutral-400 leading-normal">
                        Mendukung GoPay, OVO, ShopeePay, DANA, BCA, Mandiri, BRI, BNI & seluruh m-banking.
                      </p>
                    </div>
                  </>
                ) : selectedMethod === 'va_bca' ? (
                  <div className="w-full space-y-4">
                    <div className="bg-black/60 border border-white/15 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-white">
                          BCA Virtual Account
                        </span>
                        <Building2 className="w-4 h-4 text-[#f570b7]" />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">
                          Nomor Virtual Account
                        </span>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="font-mono text-lg font-bold text-[#f570b7] tracking-wider">
                            8910 8123 4567 8901
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('8910812345678901')}
                            className="p-1.5 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20 text-white cursor-pointer"
                            title="Salin Nomor VA"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isChecking}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(248,19,141,0.4)]"
                    >
                      {isChecking ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengecek Transfer...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cek Status Pembayaran</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="bg-black/60 border border-white/15 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-white">
                          GoPay / E-Wallet
                        </span>
                        <Wallet className="w-4 h-4 text-[#f570b7]" />
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        Klik tombol di bawah ini untuk membuka aplikasi Gojek atau selesaikan dengan scan kode QRIS.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isChecking}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F8138D] to-[#f570b7] hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(248,19,141,0.4)]"
                    >
                      {isChecking ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Menghubungkan ke GoPay...</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Buka Aplikasi GoPay</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full mt-4 space-y-4 relative z-10">
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#f570b7]" />
            <span>Cara Pembayaran Menggunakan QRIS</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-300">
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="w-6 h-6 rounded-lg bg-[#F8138D]/20 border border-[#F8138D]/40 text-[#f570b7] font-bold text-[11px] flex items-center justify-center mb-2">
                1
              </span>
              <span className="font-bold text-white block">Buka Aplikasi</span>
              <span className="text-neutral-400 leading-relaxed block">
                Buka aplikasi m-Banking atau E-Wallet (BCA Mobile, Livin, GoPay, ShopeePay, OVO, Dana).
              </span>
            </div>

            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="w-6 h-6 rounded-lg bg-[#F8138D]/20 border border-[#F8138D]/40 text-[#f570b7] font-bold text-[11px] flex items-center justify-center mb-2">
                2
              </span>
              <span className="font-bold text-white block">Scan Kode QR</span>
              <span className="text-neutral-400 leading-relaxed block">
                Pilih menu Scan / Bayar QRIS lalu arahkan kamera ke kode QR di layar ini.
              </span>
            </div>

            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="w-6 h-6 rounded-lg bg-[#F8138D]/20 border border-[#F8138D]/40 text-[#f570b7] font-bold text-[11px] flex items-center justify-center mb-2">
                3
              </span>
              <span className="font-bold text-white block">Konfirmasi & Bayar</span>
              <span className="text-neutral-400 leading-relaxed block">
                Periksa nama merchant dan nominal Rp {order.total.toLocaleString('id-ID')}, lalu masukkan PIN Anda.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
