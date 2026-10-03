import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  isCartOpen,
  cartItems,
  cartSubtotal,
  closeCart,
  updateQuantity,
  removeFromCart,
  clearCart
} from '../../stores/cartStore';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartDrawer() {
  const isOpen = useStore(isCartOpen);
  const items = useStore(cartItems);
  const subtotal = useStore(cartSubtotal);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCheckoutComplete(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
      setTimeout(() => {
        clearCart();
      }, 1500);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden transition-all duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity cursor-pointer"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111113] border-l border-white/10 text-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#00e5ff]" />
              <h2 className="text-lg font-display font-bold tracking-wider">YOUR BAG</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#00e5ff] font-semibold">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {checkoutComplete ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-[#00e5ff] animate-bounce" />
                <h3 className="text-xl font-display font-bold">ORDER CONFIRMED!</h3>
                <p className="text-sm text-neutral-400 max-w-xs">
                  Thank you for supporting Tomorrow X Together! Your simulated order has been processed successfully.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-4 px-6 py-2.5 bg-[#00e5ff] text-black font-semibold rounded-md text-xs uppercase tracking-widest hover:bg-[#79ffe1] transition-all cursor-pointer"
                >
                  Back to Showcase
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-neutral-400">
                <ShoppingBag className="w-12 h-12 stroke-[1.5] text-neutral-600" />
                <p className="text-base font-medium">Your shopping bag is empty</p>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Explore official TXT merchandise, tour essentials, and exclusive album pressings.
                </p>
                <a
                  href="/store"
                  onClick={closeCart}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs uppercase font-semibold tracking-wider transition-all"
                >
                  Explore Store
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.id}-${item.size || ''}-${item.color || ''}`}
                  className="flex gap-4 p-3 rounded-lg bg-neutral-900/60 border border-white/5 hover:border-white/15 transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md bg-black/40 border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold truncate text-white">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>• Color: {item.color}</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-[#00e5ff]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-md px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                          className="p-1 hover:text-[#00e5ff] text-neutral-400 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="p-1 hover:text-[#00e5ff] text-neutral-400 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        className="text-neutral-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {!checkoutComplete && items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-neutral-950/70 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">Subtotal</span>
                <span className="text-xl font-bold font-display text-white">
                  ${subtotal.toFixed(2)} USD
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-tight">
                Taxes and shipping calculated at checkout. Free shipping on official albums.
              </p>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3.5 bg-[#00e5ff] hover:bg-[#79ffe1] text-black font-bold uppercase tracking-wider text-xs rounded-md shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout Now
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
