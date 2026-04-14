import React from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../hooks/useToast";
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Minus,
  Plus,
  Tag,
} from "lucide-react";

export const Cart: React.FC<{ setCurrentTab: (t: string) => void }> = ({
  setCurrentTab,
}) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useApp();
  const { showToast } = useToast();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // GST 18%
  const shipping = subtotal > 5000 ? 0 : 100; // Free shipping above ₹5000
  const total = subtotal + tax + shipping;
  const savings = cart.reduce((acc, item) => {
    if (item.originalPrice)
      return acc + (item.originalPrice - item.price) * item.quantity;
    return acc;
  }, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-24 animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Your cart is empty
          </h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            Discover our curated collections and find something you love.
          </p>
          <button
            onClick={() => {
              setCurrentTab("products");
              window.scrollTo(0, 0);
            }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">
        Shopping Cart{" "}
        <span className="text-slate-400 font-normal text-lg">
          ({cart.length} items)
        </span>
      </h1>

      {savings > 0 && (
        <div className="mb-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <Tag className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">
            You're saving{" "}
            <span className="font-bold">₹{savings.toFixed(2)}</span> on this
            order!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={`${item._id}-${item.selectedSize}-${item.selectedColor}`}
              className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm"
            >
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg bg-slate-100 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/100x100/f1f5f9/94a3b8?text=Aaiza";
                }}
              />

              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-brand-500 font-bold block mb-1">
                  {item.category}
                </span>
                <h4 className="font-bold text-slate-900 text-sm truncate">
                  {item.name}
                </h4>
                {(item.selectedSize || item.selectedColor) && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.selectedSize && `Size: ${item.selectedSize}`}
                    {item.selectedSize && item.selectedColor && " • "}
                    {item.selectedColor && `Color: ${item.selectedColor}`}
                  </p>
                )}
                <p className="text-sm font-bold text-slate-900 mt-1">
                  ₹{item.price.toFixed(2)}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                <button
                  onClick={() =>
                    updateCartQuantity(
                      item._id,
                      item.selectedSize,
                      item.selectedColor,
                      item.quantity - 1,
                    )
                  }
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-bold text-slate-900 min-w-[32px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateCartQuantity(
                      item._id,
                      item.selectedSize,
                      item.selectedColor,
                      item.quantity + 1,
                    )
                  }
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Line Total */}
              <div className="text-right shrink-0 hidden sm:block">
                <span className="font-bold text-slate-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>

              {/* Delete */}
              <button
                onClick={() => {
                  removeFromCart(
                    item._id,
                    item.selectedSize,
                    item.selectedColor,
                  );
                  showToast("Item removed from cart", "info");
                }}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              clearCart();
              showToast("Cart cleared", "info");
            }}
            className="text-sm font-medium text-slate-400 hover:text-rose-500 transition-colors mt-2"
          >
            Clear entire cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6">
              Order Summary
            </h3>

            <div className="space-y-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-800 font-semibold">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">GST (18%)</span>
                <span className="text-slate-800 font-semibold">
                  ₹{tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span
                  className={
                    shipping === 0
                      ? "text-emerald-600 font-semibold"
                      : "text-slate-800 font-semibold"
                  }
                >
                  {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-slate-400">
                  Free shipping on orders over ₹5000
                </p>
              )}
            </div>

            <div className="flex justify-between items-baseline mb-6">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-extrabold text-brand-600">
                ₹{total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => {
                setCurrentTab("checkout");
                window.scrollTo(0, 0);
              }}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCurrentTab("products");
                window.scrollTo(0, 0);
              }}
              className="w-full mt-3 py-2.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
