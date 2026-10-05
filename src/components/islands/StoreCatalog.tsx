import React, { useState } from 'react';
import { addToCart, openCart } from '../../stores/cartStore';
import productsData from '../../data/products.json';
import { ShoppingBag, ArrowRight, Search, Sparkles, Check } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  tagline?: string;
  category: string;
  price: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  image: string;
  gallery?: string[];
  description: string;
  isFeatured: boolean;
  stock: number;
  sku?: string;
  releaseDate?: string;
  manufacturer?: string;
  origin?: string;
  colors?: string[];
  sizes?: string[];
  details?: string[];
  features?: string[];
  packageContents?: string[];
  specifications?: Record<string, any>;
}

export default function StoreCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Albums', 'Tour Merch', 'Apparel', 'Accessories'];

  const filteredProducts = (productsData as unknown as Product[]).filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
      size: product.sizes?.[0] || 'Standard',
      color: product.colors?.[0] || 'Default',
      quantity: 1,
    });
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
      openCart();
    }, 600);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sm:mb-12">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold font-mono tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#F8138D] text-white shadow-[0_0_15px_rgba(248,19,141,0.4)] font-bold'
                  : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search merchandise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-900/80 border border-white/10 rounded-full text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F8138D] transition-all font-mono"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-neutral-950/40 rounded-2xl border border-white/5">
          <p className="text-neutral-400 text-sm">No merchandise found matching your criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-semibold uppercase tracking-wider font-mono cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const isAdded = addedItemIds[product.id];
            return (
              <a
                key={product.id}
                href={`/store/${product.id}`}
                className="group relative bg-[#131316] border border-white/10 rounded-2xl overflow-hidden hover:border-[#F8138D]/50 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-black/60">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase bg-black/70 backdrop-blur-md text-[#F8138D] border border-white/10">
                      {product.category}
                    </span>
                  </div>

                  {product.isFeatured && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase bg-[#F8138D] text-white shadow-[0_0_10px_rgba(248,19,141,0.5)]">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    </div>
                  )}

                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-[#F8138D] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-mono block">Price</span>
                      <span className="text-lg font-bold font-mono text-white">
                        ${product.price.toFixed(2)}{' '}
                        <span className="text-xs text-neutral-400 font-normal">USD</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                          : 'bg-white/10 hover:bg-[#F8138D] hover:text-white text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
