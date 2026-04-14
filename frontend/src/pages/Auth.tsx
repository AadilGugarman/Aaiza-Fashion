import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../hooks/useToast";
import {
  Lock,
  ArrowRight,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

export const Auth: React.FC<{ setCurrentTab: (t: string) => void }> = ({
  setCurrentTab,
}) => {
  const { login, register, currentUser } = useApp();
  const { showToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      if (!name.trim()) {
        showToast("Please enter your full name", "error");
        setLoading(false);
        return;
      }
      try {
        // Registration always creates customer account (no admin role)
        await register(email, name, password);
        showToast(
          "Account created successfully! Welcome to Aaiza Fashion.",
          "success",
        );
        setCurrentTab("home");
      } catch (error) {
        showToast(
          "Registration failed. Please try again.",
          "error",
        );
        console.error("Register error:", error);
      }
    } else {
      try {
        await login(email, name || email.split("@")[0], "user", password);
        const isAdmin = currentUser?.role === "admin";
        showToast(
          isAdmin
            ? "Welcome back! Signed in as Administrator."
            : "Welcome back! Signed in as Customer.",
          "success",
        );
        setCurrentTab(isAdmin ? "admin" : "home");
      } catch (error) {
        showToast(
          "Login failed. Please try again.",
          "error",
        );
        console.error("Login error:", error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Decorative top element */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-2xl mb-4 shadow-lg shadow-brand-500/10">
            <Lock className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isRegister ? "Create Your Account" : "Welcome Back"}
          </h2>
          <p className="text-slate-500 mt-2">
            {isRegister
              ? "Join Aaiza Fashion for exclusive collections and offers"
              : "Sign in to your Aaiza Fashion account"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  <span className="text-slate-700">Account Type</span>
                  <span className="text-slate-400 text-xs ml-2">
                    (Customer Only)
                  </span>
                </label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p className="font-medium">👤 Customer Account</p>
                  <p className="text-xs mt-1">
                    Admin accounts are created by the store owner. Contact
                    support if you need admin access.
                  </p>
                </div>
              </div>
            )}

            {!isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Account Type
                </label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p className="font-medium">👤 Customer Login</p>
                  <p className="text-xs mt-1">
                    Sign in to your customer account. Admin access is granted by store administrators.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? "Create Account" : "Sign In"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
              >
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
