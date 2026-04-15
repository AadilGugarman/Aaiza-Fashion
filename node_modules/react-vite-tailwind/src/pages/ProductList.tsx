import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../hooks/useToast";
import {
  ShoppingCart,
  Star,
  Heart,
  SlidersHorizontal,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

export const ProductList: React.FC<{
  setSelectedProduct: (id: string) => void;
  isWishlistMode?: boolean;
}> = ({ setSelectedProduct, isWishlistMode = false }) => {
  const { products, categories, addToCart, wishlist, toggleWishlist } =
    useApp();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [sortBy, setSortBy] = useState<
    "price-asc" | "price-desc" | "rating" | "newest"
  >("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showWishlistOnlyState, setShowWishlistOnlyState] = useState(false);
  const showWishlistOnly = isWishlistMode || showWishlistOnlyState;
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const itemsPerPage = 8;

  const productsRef = React.useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    let result = products
      .filter((p) => selectedCat === "All" || p.category === selectedCat)
      .filter((p) => p.price <= priceRange)
      .filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((p) => !showWishlistOnly || wishlist.includes(p._id))
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        // newest: sort by _id descending (higher IDs are newer)
        return b._id.localeCompare(a._id);
      });
    return result;
  }, [
    products,
    selectedCat,
    priceRange,
    search,
    sortBy,
    showWishlistOnly,
    wishlist,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset page on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCat, priceRange, sortBy, search, showWishlistOnly]);

  // Scroll to top when page changes
  React.useEffect(() => {
    if (productsRef.current) {
      productsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentPage]);

  const handleAddToCart = (prod: (typeof products)[0]) => {
    addToCart(prod);
    showToast(`${prod.name} added to cart!`, "success");
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Filters</h3>
        <button
          onClick={() => {
            setSelectedCat("All");
            setPriceRange(50000);
            if (!isWishlistMode) setShowWishlistOnlyState(false);
            setSearch("");
          }}
          className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
        >
          Reset All
        </button>
      </div>

      {/* Categories */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
          Categories
        </label>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCat === cat
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Max Price: ₹{priceRange}
        </label>
        <input
          type="range"
          min={0}
          max={50000}
          step={500}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
          <span>₹0</span>
          <span>₹50000</span>
        </div>
      </div>

      {/* Wishlist Toggle */}
      {!isWishlistMode && (
        <div>
          <button
            onClick={() => setShowWishlistOnlyState(!showWishlistOnlyState)}
            className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              showWishlistOnly
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${showWishlistOnly ? "fill-current" : ""}`}
            />
            {showWishlistOnly ? "Showing Wishlist" : "Show Wishlist Only"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {showWishlistOnly ? "My Wishlist" : "Shop Collection"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {filteredProducts.length} items found
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-brand-400"
          >
            <option value="newest">Newest</option>
            <option value="rating">Top Rated</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>

          {/* Grid / List */}
          <div className="hidden sm:flex bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-brand-100 text-brand-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-brand-100 text-brand-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div
          className={`lg:col-span-1 ${showMobileFilters ? "block" : "hidden lg:block"}`}
        >
          <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-24 shadow-sm">
            <FilterSidebar />
          </div>
        </div>

        {/* Products */}
        <div className="lg:col-span-3" ref={productsRef}>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500 text-lg mb-2">
                {showWishlistOnly
                  ? "Your wishlist is empty"
                  : "No products match your filters"}
              </p>
              {!showWishlistOnly && (
                <button
                  onClick={() => {
                    setSelectedCat("All");
                    setPriceRange(50000);
                    setSearch("");
                    setShowWishlistOnlyState(false);
                  }}
                  className="text-brand-600 font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((prod) => {
                  const inWishlist = wishlist.includes(prod._id);
                  return (
                    <div
                      key={prod._id}
                      className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                    >
                      <div className="relative overflow-hidden bg-slate-100 aspect-[3/4]">
                        <img
                          onClick={() => setSelectedProduct(prod._id)}
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/400x500/f1f5f9/94a3b8?text=Aaiza+Fashion";
                          }}
                        />
                        <button
                          onClick={() => toggleWishlist(prod._id)}
                          className={`absolute top-3 right-3 p-2 rounded-full border backdrop-blur-sm transition-all shadow-sm ${
                            inWishlist
                              ? "bg-brand-500 text-white border-brand-500"
                              : "bg-white/90 text-slate-500 border-slate-200 hover:bg-white"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`}
                          />
                        </button>
                        {prod.isNew && (
                          <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] uppercase font-bold text-brand-500 tracking-widest">
                          {prod.category}
                        </span>
                        <h3
                          onClick={() => setSelectedProduct(prod._id)}
                          className="font-bold text-slate-900 mt-1 mb-2 hover:text-brand-600 cursor-pointer line-clamp-1 text-sm"
                        >
                          {prod.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          <span className="text-xs font-semibold text-slate-700">
                            {prod.rating}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({prod.reviewsCount})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-extrabold text-slate-900">
                              ₹{prod.price.toFixed(2)}
                            </span>
                            {prod.originalPrice && (
                              <span className="text-sm text-slate-400 line-through">
                                ₹{prod.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddToCart(prod)}
                            disabled={prod.stock === 0}
                            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition-colors text-xs font-semibold flex items-center gap-1.5"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                          currentPage === page
                            ? "bg-brand-600 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* List View */
            <div className="flex flex-col gap-4">
              {paginatedProducts.map((prod) => {
                const inWishlist = wishlist.includes(prod._id);
                return (
                  <div
                    key={prod._id}
                    className="flex flex-col sm:flex-row items-center bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all p-4 gap-5"
                  >
                    <div
                      onClick={() => setSelectedProduct(prod._id)}
                      className="w-full sm:w-40 h-40 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative cursor-pointer"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/200x200/f1f5f9/94a3b8?text=Aaiza+Fashion";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-brand-500 tracking-widest">
                        {prod.category}
                      </span>
                      <h3
                        onClick={() => setSelectedProduct(prod._id)}
                        className="font-bold text-slate-900 text-lg mb-1 hover:text-brand-600 cursor-pointer"
                      >
                        {prod.name}
                      </h3>
                      <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                        {prod.description}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />{" "}
                          {prod.rating}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span
                          className={
                            prod.stock > 0
                              ? "text-emerald-600"
                              : "text-rose-500"
                          }
                        >
                          {prod.stock > 0
                            ? `${prod.stock} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-slate-900">
                          ₹{prod.price.toFixed(2)}
                        </span>
                        {prod.originalPrice && (
                          <span className="block text-sm text-slate-400 line-through">
                            ₹{prod.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleWishlist(prod._id)}
                          className={`p-2 rounded-lg border transition-all ${
                            inWishlist
                              ? "bg-brand-50 border-brand-200 text-brand-500"
                              : "bg-white border-slate-200 text-slate-400 hover:text-brand-500"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`}
                          />
                        </button>
                        <button
                          onClick={() => handleAddToCart(prod)}
                          disabled={prod.stock === 0}
                          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm flex items-center gap-1.5"
                        >
                          <ShoppingCart className="w-4 h-4" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination for list view */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === page ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
