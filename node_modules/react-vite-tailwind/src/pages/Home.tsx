import React from "react";
import { useApp } from "../context/AppContext";
import { ImageSlider } from "../components/ImageSlider";
import {
  ShoppingCart,
  Star,
  ArrowRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface HomeProps {
  setCurrentTab: (t: string) => void;
  setSelectedProduct: (id: string) => void;
}

const categoryIcons: Record<string, string> = {
  Dresses: "👗",
  Outerwear: "🧥",
  Knitwear: "🧶",
  Bottoms: "👖",
  Tops: "👚",
  Accessories: "👜",
};

export const Home: React.FC<HomeProps> = ({
  setCurrentTab,
  setSelectedProduct,
}) => {
  // Ensure the passed handlers are always functions (avoid string|undefined TS noise)
  if (!setCurrentTab || !setSelectedProduct) return null;

  const { products, categories, addToCart, wishlist, toggleWishlist } =
    useApp();

  const newArrivals = products.filter((p) => p.isNew).slice(0, 6);
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 6);

  const renderProductCard = (prod: (typeof products)[0]) => {
    const inWishlist = wishlist.includes(prod._id);
    return (
      <div
        key={prod._id}
        className="group bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-brand-500/10 dark:hover:shadow-black/50 hover:border-brand-400/30 dark:hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onClick={() => setSelectedProduct(prod._id)}
      >
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 aspect-[3/4]">
          <img
            src={prod.images[0]}
            alt={prod.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/400x500/f1f5f9/94a3b8?text=Aaiza+Fashion";
            }}
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {prod.isNew && (
              <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                New
              </span>
            )}
            {prod.isBestseller && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Bestseller
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(prod._id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full border backdrop-blur-sm transition-all shadow-sm hover:scale-110 ${
              inWishlist
                ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/30"
                : "bg-white/90 text-slate-500 border-slate-200 hover:bg-white hover:shadow-md"
            }`}
          >
            <HeartIcon filled={inWishlist} />
          </button>
          {prod.originalPrice && (
            <span className="absolute bottom-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{Math.round((1 - prod.price / prod.originalPrice) * 100)}%
            </span>
          )}

          {/* Quick Add to Cart Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(prod, 1);
              }}
              className="bg-white text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 touch-button"
            >
              Quick Add
            </button>
          </div>
        </div>

        <div className="p-4">
          <span className="text-[10px] uppercase font-bold text-brand-500 dark:text-brand-400 tracking-widest">
            {prod.category}
          </span>
          <h3
            onClick={() => setSelectedProduct(prod._id)}
            className="font-bold text-slate-900 dark:text-white mt-1 mb-2 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer line-clamp-2 text-sm leading-tight min-h-[2.5rem]"
          >
            {prod.name}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {prod.rating}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({prod.reviewsCount})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                ₹{prod.price.toFixed(2)}
              </span>
              {prod.originalPrice && (
                <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                  ₹{prod.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <button
              disabled={prod.stock === 0}
              onClick={() => addToCart(prod)}
              className="p-2 bg-brand-600 hover:bg-brand-700 dark:hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg transition-colors shadow-sm shadow-brand-500/20"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#db2777_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-white mb-4 sm:mb-6 backdrop-blur-sm">
              <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-300" />
              Spring / Summer 2026 Collection
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-4 sm:mb-6 leading-tight font-heading text-balance">
              Redefine Your
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-amber-300 to-brand-400">
                Signature Style
              </span>
            </h1>
            <p className="max-w-xl text-base sm:text-lg text-slate-300 mb-6 sm:mb-10 leading-relaxed font-body text-pretty"></p>

            <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4">
              <button
                onClick={() => setCurrentTab("products")}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-brand-600 hover:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
              >
                Shop Collection <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
              <button
                onClick={() => {
                  setCurrentTab("products");
                }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-sm transition-all text-sm sm:text-base"
              >
                New Arrivals
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Banner Slider */}
      {bestsellers.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-white dark:bg-slate-950 transition-colors">
          <ImageSlider
            images={bestsellers.slice(0, 5).map((p) => p.images[0])}
            title="Featured Collections"
            onImageClick={(index) => setSelectedProduct(bestsellers[index]._id)}
          />
        </div>
      )}

      {/* Trust Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-4 sm:py-5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
            <div className="p-2 sm:p-2.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Free Shipping Over ₹5000
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Delivered to your doorstep
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 justify-center">
            <div className="p-2 sm:p-2.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                30-Day Easy Returns
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No questions asked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-end">
            <div className="p-2 sm:p-2.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Secure Payment
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SSL encrypted checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white dark:bg-slate-950 transition-colors">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6 sm:mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories
            .filter((c) => c !== "All")
            .map((cat) => (
              <button
                key={cat}
                onClick={() => setCurrentTab("products")}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 rounded-xl p-4 sm:p-6 text-center hover:shadow-md hover:shadow-brand-500/10 dark:hover:shadow-black/30 transition-all group flex flex-col items-center gap-2 sm:gap-3"
              >
                <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
                  {categoryIcons[cat] || "🛍️"}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                  {cat}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Bestsellers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-white dark:bg-slate-950 transition-colors">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Bestsellers
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Our most loved pieces this season
            </p>
          </div>
          <button
            onClick={() => setCurrentTab("products")}
            className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestsellers.map(renderProductCard)}
        </div>
      </div>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  New Arrivals
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Fresh additions to our collection
                </p>
              </div>
              <button
                onClick={() => setCurrentTab("products")}
                className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {newArrivals.map(renderProductCard)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
