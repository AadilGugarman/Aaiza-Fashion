import React, { useState, useEffect } from "react";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./hooks/useToast";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { ProductList } from "./pages/ProductList";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Auth } from "./pages/Auth";
import { UserProfile } from "./pages/UserProfile";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Gem } from "lucide-react";

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentTab, selectedProduct]);

  const renderContent = () => {
    if (selectedProduct) {
      return (
        <ProductDetail
          productId={selectedProduct}
          setSelectedProduct={setSelectedProduct}
        />
      );
    }

    switch (currentTab) {
      case "home":
        return (
          <Home
            setCurrentTab={setCurrentTab}
            setSelectedProduct={setSelectedProduct}
          />
        );
      case "products":
        return <ProductList setSelectedProduct={setSelectedProduct} />;
      case "wishlist":
        return (
          <ProductList
            setSelectedProduct={setSelectedProduct}
            isWishlistMode={true}
          />
        );
      case "cart":
        return <Cart setCurrentTab={setCurrentTab} />;
      case "checkout":
        return <Checkout setCurrentTab={setCurrentTab} />;
      case "auth":
        return <Auth setCurrentTab={setCurrentTab} />;
      case "profile":
        return <UserProfile />;
      case "admin":
        return <AdminDashboard />;
      default:
        return (
          <Home
            setCurrentTab={setCurrentTab}
            setSelectedProduct={setSelectedProduct}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="flex-grow">{renderContent()}</main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-900 text-slate-400 dark:text-slate-400 py-12 sm:py-16 mt-16 border-t border-slate-800/10 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-1.5 rounded-lg">
                  <Gem className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-extrabold text-white">
                  Aaiza<span className="text-brand-400">Fashion</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Curating timeless elegance and contemporary fashion for the
                modern individual.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
                Shop
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setCurrentTab("products")}
                    className="hover:text-white transition-colors"
                  >
                    All Products
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab("products")}
                    className="hover:text-white transition-colors"
                  >
                    New Arrivals
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab("products")}
                    className="hover:text-white transition-colors"
                  >
                    Bestsellers
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
                Account
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setCurrentTab("auth")}
                    className="hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab("profile")}
                    className="hover:text-white transition-colors"
                  >
                    My Orders
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab("wishlist")}
                    className="hover:text-white transition-colors"
                  >
                    Wishlist
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
                Support
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Contact Us
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Shipping & Returns
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Size Guide
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <span>© 2026 Aaiza Fashion. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Gem className="w-3 h-3 text-brand-400" /> Premium Quality
              </span>
              <span>•</span>
              <span>Secure Checkout</span>
              <span>•</span>
              <span>Free Returns</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
}
