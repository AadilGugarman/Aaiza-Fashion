import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../hooks/useToast";
import {
  ShoppingCart,
  Star,
  Heart,
  ArrowLeft,
  Send,
  ShieldCheck,
  Truck,
  RefreshCw,
  Minus,
  Plus,
} from "lucide-react";

export const ProductDetail: React.FC<{
  productId: string;
  setSelectedProduct: (id: string | null) => void;
}> = ({ productId, setSelectedProduct }) => {
  const { products, addToCart, wishlist, toggleWishlist, currentUser } =
    useApp();
  const { showToast } = useToast();
  const product = products.find((p) => p._id === productId);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || "",
  );
  const [reviewText, setReviewText] = useState("");
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewsList, setReviewsList] = useState(product?.reviews || []);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center animate-fade-in">
        <p className="text-slate-500 mb-4">Product not found.</p>
        <button
          onClick={() => setSelectedProduct(null)}
          className="text-brand-600 font-semibold hover:underline"
        >
          Return to products
        </button>
      </div>
    );
  }

  const inWishlist = wishlist.includes(product._id);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    const newReview = {
      id: "rev-" + Date.now(),
      user: currentUser?.name || "Guest",
      text: reviewText,
      rating: ratingVal,
      date: new Date().toISOString().split("T")[0],
    };
    setReviewsList((prev) => [newReview, ...prev]);
    setReviewText("");
    showToast("Review submitted! Thank you for your feedback.", "success");
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    showToast(`${product.name} added to cart!`, "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Link */}
      <button
        onClick={() => setSelectedProduct(null)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </button>

      {/* Main Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden relative flex items-center justify-center h-[400px] md:h-[500px] group cursor-zoom-in">
            {!imgLoaded && (
              <div className="absolute inset-0 bg-slate-100 animate-pulse rounded-2xl" />
            )}
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className={`max-h-full w-full object-cover transition-all duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"} group-hover:scale-105`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
            />
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`absolute top-4 right-4 p-3 rounded-full border backdrop-blur-sm transition-all shadow-sm ${
                inWishlist
                  ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/30"
                  : "bg-white/90 text-slate-500 border-slate-200 hover:bg-white"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
              />
            </button>
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                NEW
              </span>
            )}
            {product.isBestseller && (
              <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                BESTSELLER
              </span>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-brand-500 shadow-md shadow-brand-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/80x80/f1f5f9/94a3b8?text=Img";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">
            {product.category}{" "}
            {product.subcategory ? `› ${product.subcategory}` : ""}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="text-sm font-bold text-amber-700">
                {product.rating}
              </span>
            </div>
            <span className="text-sm text-slate-500">
              ({reviewsList.length} reviews)
            </span>
            <span className="text-slate-300">|</span>
            <span
              className={`text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-rose-500"}`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Save ₹{(product.originalPrice - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <p className="text-slate-600 text-base leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Size:{" "}
                <span className="font-bold text-brand-600">
                  {selectedSize || "Select size"}
                </span>
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-12 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 focus-ring ${
                      selectedSize === size
                        ? "border-brand-500 bg-brand-50 text-brand-700 shadow-md shadow-brand-500/20"
                        : "border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Color:{" "}
                <span className="font-bold text-brand-600">
                  {selectedColor || "Select color"}
                </span>
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 focus-ring ${
                      selectedColor === color
                        ? "border-brand-500 bg-brand-50 text-brand-700 shadow-md shadow-brand-500/20"
                        : "border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50/50"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guarantees */}
          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 mb-8 border-y border-slate-100 py-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-500" />
              <span>Free shipping over ₹5000</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-brand-500" />
              <span>30-day returns</span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-slate-900 font-bold min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="px-4 py-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-slate-200 pt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">
          Customer Reviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Review Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-fit shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Write a Review
            </h3>
            <form onSubmit={handleAddReview}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Your Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      className={`text-xl transition-colors ${star <= ratingVal ? "text-amber-400" : "text-slate-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Your Review
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-4">
            {reviewsList.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-500">
                  No reviews yet. Be the first to review this product!
                </p>
              </div>
            ) : (
              reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xs uppercase">
                        {rev.user[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-sm">
                          {rev.user}
                        </span>
                        {rev.date && (
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(rev.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mt-2">{rev.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
