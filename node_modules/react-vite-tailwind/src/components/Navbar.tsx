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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        {/* Top Bar */}
        <div className="bg-slate-900 text-white text-xs py-1.5 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <span>
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
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleNav("home")}
            >
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2 rounded-xl shadow-md shadow-brand-500/20">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Aaiza<span className="text-brand-600">Fashion</span>
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
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" /> Dashboard
                </button>
              )}
            </nav>

            {/* User Controls */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <button
                onClick={() => handleNav("wishlist")}
                className={`relative p-2.5 rounded-lg transition-colors ${
                  currentTab === "wishlist"
                    ? "bg-brand-50 text-brand-600"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
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
                className={`relative p-2.5 rounded-lg transition-colors ${
                  currentTab === "cart"
                    ? "bg-brand-50 text-brand-600"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
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
                <div className="hidden sm:flex items-center gap-2 ml-1 pl-3 border-l border-slate-200">
                  <button
                    onClick={() => handleNav("profile")}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                      currentTab === "profile"
                        ? "bg-brand-50"
                        : "hover:bg-slate-50"
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
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {currentUser.name.split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">
                        {currentUser.role}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      handleNav("home");
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNav("auth")}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  <User className="w-4 h-4" /> Sign In
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
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
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl animate-slide-in-right md:hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-extrabold text-slate-900 text-lg">
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
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
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-700 hover:bg-slate-50"
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
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" /> Dashboard
                  </button>
                )}
              </nav>

              <div className="mt-6 pt-6 border-t border-slate-100">
                {currentUser ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleNav("profile")}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {currentUser.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900">
                          {currentUser.name}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase">
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
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNav("auth")}
                    className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
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
