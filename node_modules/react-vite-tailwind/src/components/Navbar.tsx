import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ThemeToggle } from "./ThemeToggle";
import {
  ShoppingCart,
  Heart,
  LogOut,
  Menu,
  X,
  User,
  Gem,
  LayoutGrid,
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const { cart, wishlist, currentUser, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "products", label: "Shop" },
  ];

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-800 shadow-sm transition-colors duration-300">
        {/* Top Bar */}
        <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs py-1.5 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center gap-4 flex-wrap">
            <span className="text-slate-300">
              ✨ Free shipping on orders over ₹5000 — Use code{" "}
              <strong className="text-brand-300">AAIZA15</strong> for 15% off
            </span>
            <div className="flex items-center gap-4">
              {currentUser ? (
                <span className="text-slate-300">
                  Welcome,{" "}
                  <strong className="text-white">{currentUser.name}</strong>
                </span>
              ) : (
                <span className="text-slate-400">
                  New here?{" "}
                  <button
                    onClick={() => handleNav("auth")}
                    className="text-brand-300 font-semibold hover:underline"
                  >
                    Create account
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
              onClick={() => handleNav("home")}
            >
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-1.5 sm:p-2 rounded-xl shadow-md shadow-brand-500/20">
                <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
                  Aaiza
                  <span className="text-brand-600 dark:text-brand-400">
                    Fashion
                  </span>
                </span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentTab === item.id
                      ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {currentUser?.role === "admin" && (
                <button
                  onClick={() => handleNav("admin")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    currentTab === "admin"
                      ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" /> Dashboard
                </button>
              )}
            </nav>

            {/* User Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="hidden" aria-hidden="true" />

              <button
                onClick={() => handleNav("wishlist")}
                className={`relative p-2 sm:p-2.5 rounded-lg transition-colors ${
                  currentTab === "wishlist"
                    ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNav("cart")}
                className={`relative p-2 sm:p-2.5 rounded-lg transition-colors ${
                  currentTab === "cart"
                    ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {currentUser ? (
                <div className="hidden sm:flex items-center gap-2 ml-1 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleNav("profile")}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                      currentTab === "profile"
                        ? "bg-brand-50 dark:bg-brand-900/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase ${
                        currentUser.role === "admin"
                          ? "bg-gradient-to-br from-brand-500 to-brand-700"
                          : "bg-gradient-to-br from-slate-600 to-slate-800"
                      }`}
                    >
                      {currentUser.name[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {currentUser.name.split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase">
                        {currentUser.role}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      handleNav("home");
                    }}
                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNav("auth")}
                  className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  <User className="w-4 h-4" /> Sign In
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-900 z-50 shadow-2xl animate-slide-in-right md:hidden transition-colors">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-extrabold text-slate-900 dark:text-white text-lg">
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      currentTab === item.id
                        ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                {currentUser?.role === "admin" && (
                  <button
                    onClick={() => handleNav("admin")}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      currentTab === "admin"
                        ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" /> Dashboard
                  </button>
                )}
              </nav>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                {currentUser ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleNav("profile")}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {currentUser.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {currentUser.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                          {currentUser.role}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        handleNav("home");
                        setMobileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNav("auth")}
                    className="w-full py-3 bg-brand-600 dark:bg-brand-700 hover:bg-brand-700 dark:hover:bg-brand-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4" /> Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
