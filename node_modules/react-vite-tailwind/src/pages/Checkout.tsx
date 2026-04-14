import React, { useState } from "react";
import { API_BASE } from "../utils/api";
import { useApp } from "../context/AppContext";
import { useToast } from "../hooks/useToast";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Truck,
  Package,
  Smartphone,
  Building,
  Wallet,
  Truck as TruckIcon,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout: React.FC<{ setCurrentTab: (t: string) => void }> = ({
  setCurrentTab,
}) => {
  const { cart, placeOrder, currentUser } = useApp();
  const { showToast } = useToast();

  const [step, setStep] = useState<"shipping" | "payment" | "confirm">(
    "shipping",
  );
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [form, setForm] = useState({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    cardNum: "",
    expDate: "",
    cvv: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // GST 18%
  const shipping = subtotal > 5000 ? 0 : 100; // Free shipping above 5000 INR
  const total = subtotal + tax + shipping;

  const paymentMethods = [
    { id: "card", label: "Credit/Debit Card", icon: CreditCard },
    { id: "upi", label: "UPI", icon: Smartphone },
    { id: "netbanking", label: "Net Banking", icon: Building },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "cod", label: "Cash on Delivery", icon: TruckIcon },
  ];

  const validateShipping = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Required";
    if (!form.phone.trim()) errs.phone = "Required";
    if (!form.address.trim()) errs.address = "Required";
    if (!form.city.trim()) errs.city = "Required";
    if (!form.postalCode.trim()) errs.postalCode = "Required";
    if (!form.country.trim()) errs.country = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    if (paymentMethod === "cod") return true;
    if (paymentMethod === "card") {
      const errs: Record<string, string> = {};
      const cardDigits = form.cardNum.replace(/\s/g, "");
      if (cardDigits.length < 16) errs.cardNum = "Enter a valid card number";
      if (!/^\d{2}\/\d{2}$/.test(form.expDate)) errs.expDate = "MM/YY format";
      if (!/^\d{3,4}$/.test(form.cvv)) errs.cvv = "3 or 4 digits";
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  };

  const handleNext = () => {
    if (step === "shipping" && validateShipping()) {
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (step === "payment" && validatePayment()) {
      setStep("confirm");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step === "payment") {
      setStep("shipping");
      setErrors({});
    } else if (step === "confirm") {
      setStep("payment");
      setErrors({});
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === "cod") {
      return true; // No payment needed
    }

    try {
      const paymentResponse = await fetch(`${API_BASE}/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total),
          currency: "INR",
          paymentMethod: paymentMethod,
          description: "Aaiza Fashion order payment",
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error("Payment setup failed");
      }

      const paymentData = await paymentResponse.json();

      if (paymentData.method === "cod") {
        return true;
      }

      // Razorpay integration
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        order_id: paymentData.orderId,
        name: "Aaiza Fashion",
        description: "Order Payment",
        handler: function (response: any) {
          console.log("Payment successful", response);
          return true;
        },
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      return new Promise<boolean>((resolve) => {
        rzp.on("payment.success", () => resolve(true));
        rzp.on("payment.failure", () => resolve(false));
      });
    } catch (error) {
      console.error("Payment error:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const shippingAddress = {
      fullName: form.fullName,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
      phone: form.phone,
    };

    try {
      const paymentSuccess = await handlePayment();
      if (!paymentSuccess) {
        showToast("Payment failed. Please try again.", "error");
        setLoading(false);
        return;
      }

      const isSuccess = await placeOrder(
        shippingAddress,
        paymentMethods.find((m) => m.id === paymentMethod)?.label || "Unknown",
      );
      if (isSuccess) {
        setOrderId("ORD-" + (10002 + Math.floor(Math.random() * 9000)));
        showToast(
          "Order placed successfully! Check your email for confirmation.",
          "success",
        );
      } else {
        showToast("Order placement failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showToast("Something went wrong. Please try again.", "error");
    }
    setLoading(false);
  };

  // ── Order Success ──
  if (orderId) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 animate-fade-in">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            Thank you for shopping with Aaiza Fashion. Your order has been
            received and is being processed.
          </p>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left mb-8 shadow-sm">
            <div className="flex justify-between text-sm mb-3 pb-3 border-b border-slate-100">
              <span className="text-slate-500">Order Number</span>
              <span className="text-slate-900 font-mono font-semibold">
                {orderId}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-3 pb-3 border-b border-slate-100">
              <span className="text-slate-500">Payment</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Paid
              </span>
            </div>
            <div className="flex justify-between text-sm mb-3 pb-3 border-b border-slate-100">
              <span className="text-slate-500">Estimated Delivery</span>
              <span className="text-slate-900 font-medium">
                {new Date(Date.now() + 86400000 * 7).toLocaleDateString(
                  "en-US",
                  { weekday: "short", month: "short", day: "numeric" },
                )}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Total Amount</span>
              <span className="text-2xl font-bold text-brand-600">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setOrderId("");
                setCurrentTab("products");
                window.scrollTo(0, 0);
              }}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-all"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                setOrderId("");
                setCurrentTab("profile");
                window.scrollTo(0, 0);
              }}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
            >
              View Order Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout Form ──
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Link */}
      <button
        onClick={() => {
          setStep("shipping");
          setCurrentTab("cart");
        }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {[
          { key: "shipping", label: "Shipping", icon: Truck },
          { key: "payment", label: "Payment", icon: CreditCard },
          { key: "confirm", label: "Review", icon: Package },
        ].map((s, idx) => (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  ["shipping", "payment", "confirm"].indexOf(step) >= idx
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/25"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {["shipping", "payment", "confirm"].indexOf(step) > idx
                  ? "✓"
                  : idx + 1}
              </div>
              <span
                className={`text-sm font-semibold hidden sm:block ${
                  ["shipping", "payment", "confirm"].indexOf(step) >= idx
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < 2 && (
              <div
                className={`w-12 sm:w-16 h-0.5 ${
                  ["shipping", "payment", "confirm"].indexOf(step) > idx
                    ? "bg-brand-500"
                    : "bg-slate-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form Area */}
        <div className="lg:col-span-3">
          {step === "shipping" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-500" /> Shipping Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all ${errors.fullName ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}`}
                      placeholder="Ayesha Khan"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all ${errors.phone ? "border-rose-400" : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}`}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all ${errors.address ? "border-rose-400" : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}`}
                      placeholder="123 Fashion Ave, Suite 100"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all ${errors.city ? "border-rose-400" : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}`}
                      placeholder="London"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={form.postalCode}
                        onChange={(e) =>
                          setForm({ ...form, postalCode: e.target.value })
                        }
                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all ${errors.postalCode ? "border-rose-400" : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}`}
                        placeholder="SW1A 1AA"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={(e) =>
                          setForm({ ...form, country: e.target.value })
                        }
                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none transition-all ${errors.country ? "border-rose-400" : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}`}
                        placeholder="UK"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all mt-2"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-500" /> Payment
                  Method
                </h2>
                <span className="flex items-center gap-1 text-[10px] bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full font-semibold uppercase">
                  <Lock className="w-3 h-3" /> Secure
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                            paymentMethod === method.id
                              ? "border-brand-400 bg-brand-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-brand-600 focus:ring-brand-500"
                          />
                          <Icon className="w-5 h-5 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">
                            {method.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={form.cardNum}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^\d\s]/g, "");
                          setForm({ ...form, cardNum: v });
                        }}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none transition-all ${errors.cardNum ? "border-rose-400" : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={form.expDate}
                          onChange={(e) =>
                            setForm({ ...form, expDate: e.target.value })
                          }
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none transition-all ${errors.expDate ? "border-rose-400" : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={form.cvv}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              cvv: e.target.value.replace(/[^\d]/g, ""),
                            })
                          }
                          placeholder="123"
                          maxLength={4}
                          className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none transition-all ${errors.cvv ? "border-rose-400" : "border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-500 text-xs bg-slate-50 p-3 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Your payment information is encrypted and securely processed
                    through Razorpay.
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in-up">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-500" /> Review & Place
                Order
              </h2>

              <div className="space-y-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Shipping To
                  </h3>
                  <p className="text-sm font-semibold text-slate-800">
                    {form.fullName}
                  </p>
                  <p className="text-sm text-slate-600">{form.address}</p>
                  <p className="text-sm text-slate-600">
                    {form.city}, {form.postalCode} {form.country}
                  </p>
                  <p className="text-sm text-slate-600">{form.phone}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Payment
                  </h3>
                  <p className="text-sm font-semibold text-slate-800">
                    {paymentMethods.find((m) => m.id === paymentMethod)?.label}
                  </p>
                  {paymentMethod === "card" && (
                    <p className="text-sm font-mono text-slate-600">
                      •••• •••• •••• {form.cardNum.slice(-4)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={`${item._id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex gap-3"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity}{" "}
                      {item.selectedSize ? `• ${item.selectedSize}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-800 shrink-0">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-800 font-semibold">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST (18%)</span>
                <span className="text-slate-800 font-semibold">
                  ₹{tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
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
              <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                <span className="text-base font-bold text-slate-900">
                  Total
                </span>
                <span className="text-2xl font-extrabold text-brand-600">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
