import React from "react";
import { useApp } from "../context/AppContext";
import {
  Package,
  Shield,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Copy,
  CreditCard,
  Phone,
  MapPin,
} from "lucide-react";

export const UserProfile: React.FC = () => {
  const { currentUser, orders } = useApp();

  if (!currentUser) return null;

  const normalizeStatus = (status: any): string => {
    if (!status) return "Processing";
    const s = String(status).toUpperCase();
    const mapping: Record<string, string> = {
      PENDING: "Processing",
      PAID: "Confirmed",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      PROCESSING: "Processing",
      CONFIRMED: "Confirmed",
    };
    return mapping[s] || "Processing";
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "Shipped":
        return <Truck className="w-4 h-4 text-blue-500" />;
      case "Processing":
      case "Confirmed":
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Processing":
      case "Confirmed":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold uppercase shadow-lg ${
              currentUser.role === "admin"
                ? "bg-gradient-to-br from-brand-500 to-brand-700 shadow-brand-500/20"
                : "bg-gradient-to-br from-slate-600 to-slate-800"
            }`}
          >
            {currentUser.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {currentUser.name}
              </h2>
              {currentUser.role === "admin" && (
                <span className="flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm">{currentUser.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Member since{" "}
              {new Date(currentUser.joinedDate).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="w-full sm:w-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                JWT Token
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentUser.token);
                }}
                className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <div className="font-mono text-[10px] text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 truncate max-w-[220px]">
              {currentUser.token}
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Package className="w-5 h-5 text-brand-500" /> Order History
        <span className="text-sm font-normal text-slate-400">
          ({orders.length})
        </span>
      </h3>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No orders yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Start shopping to see your orders here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderId = order._id || order.id || "ORD-" + Math.random();
            const normalizedStatus = normalizeStatus(
              order.orderStatus || order.status,
            );
            return (
              <div
                key={orderId}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                        Order
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {orderId}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                        Date
                      </span>
                      <span className="text-sm text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border ${statusColor(normalizedStatus)}`}
                  >
                    {statusIcon(normalizedStatus)} {normalizedStatus}
                  </span>
                </div>

                <div className="p-4">
                  {/* Shipping Info */}
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-50">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{" "}
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.country}
                    </span>
                    {order.shippingAddress.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />{" "}
                        {order.shippingAddress.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> {order.paymentMethod}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item, idx) => {
                      const itemId = item.id || item._id || idx;
                      const images = item.images || [];
                      return (
                        <div
                          key={`${itemId}-${idx}`}
                          className="flex justify-between items-center text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={images[0]}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/50x50/f1f5f9/94a3b8?text=Aaiza";
                              }}
                            />
                            <div>
                              <p className="font-semibold text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                Qty: {item.quantity}{" "}
                                {item.selectedSize
                                  ? `• Size ${item.selectedSize}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <span className="text-slate-900 font-bold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between items-baseline">
                    <span className="text-sm text-slate-500">Grand Total</span>
                    <span className="text-xl font-extrabold text-brand-600">
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
