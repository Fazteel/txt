import React, { useState } from 'react';
import { addToCart } from '../../stores/cartStore';
import { X, Check, ShoppingBag, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  image: string;
  description: string;
  isFeatured: boolean;
  stock: number;
  colors?: string[];
  sizes?: string[];
  details?: string[];
}

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: Props) {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0] : 'Default'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#111114] border border-white/15 rounded-2xl max-w-3xl w-full text-white shadow-2xl overflow-hidden z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-white rounded-full bg-black/40 hover:bg-black/80 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery Stage */}
          <div className="bg-neutral-950 p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/10">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#F8138D]/20 text-[#F8138D] border border-[#F8138D]/40">
                  {product.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>In Stock ({product.stock} units available)</span>
            </div>
          </div>

          {/* Product Specs & Purchasing */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-[#F8138D]">
                Official Tomorrow X Together
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold mt-1 text-white">
                {product.name}
              </h2>
              <div className="text-2xl font-bold font-mono text-[#F8138D] mt-2">
                ${product.price.toFixed(2)} {product.currency}
              </div>

              <p className="text-sm text-neutral-300 mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Color variant */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
                    Variant / Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                          selectedColor === c
                            ? 'border-[#F8138D] bg-[#F8138D]/15 text-white'
                            : 'border-white/10 text-neutral-400 hover:border-white/30'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size variant */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2">
                    Size / Edition
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                          selectedSize === s
                            ? 'border-[#F8138D] bg-[#F8138D]/15 text-white'
                            : 'border-white/10 text-neutral-400 hover:border-white/30'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Details bullet points */}
              {product.details && (
                <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5 text-xs text-neutral-400">
                  {product.details.map((d, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#F8138D] mt-0.5">•</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/10 rounded-md bg-black/40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={addedNotice}
                  className="flex-1 py-3 bg-[#F8138D] hover:bg-[#f570b7] text-white font-bold uppercase tracking-wider text-xs rounded-md shadow-[0_0_20px_rgba(248,19,141,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Bag • ${(product.price * quantity).toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-neutral-400 text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F8138D]" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#F8138D]" />
                  <span>Global Dispatch</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-[#F8138D]" />
                  <span>Official Weverse</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
