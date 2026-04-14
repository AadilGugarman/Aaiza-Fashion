import React, { useState, useEffect } from "react";
import { API_BASE, buildHeaders } from "../utils/api";
import { useApp } from "../context/AppContext";
import { useToast } from "../hooks/useToast";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  Package,
  Users,
  FolderTree,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Eye,
  X,
} from "lucide-react";
import { apiFetch } from "../utils/api";

export const AdminDashboard: React.FC = () => {
  const {
    products,
    categories,
    orders,
    currentUser,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    updateOrderStatus,
  } = useApp();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "products" | "categories" | "orders" | "users"
  >("overview");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVals, setEditVals] = useState<any>({});
  const [newCat, setNewCat] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeSubTab === "users" && currentUser?.token) {
      fetchUsers();
    }
  }, [activeSubTab, currentUser]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await apiFetch("/auth/users", {
        headers: buildHeaders(currentUser!.token),
      });
      if (Array.isArray(response)) {
        setUsers(response);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      showToast("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handlePromoteToAdmin = async (userId: number) => {
    if (!currentUser?.token) {
      showToast("Admin login required", "error");
      return;
    }

    try {
      const response = await apiFetch(`/auth/users/${userId}/promote-admin`, {
        method: "PATCH",
        headers: buildHeaders(currentUser.token),
      });

      if (response && response.id) {
        showToast("User promoted to admin", "success");
        // Update the user in the list
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: "ADMIN" } : u)),
        );
      }
    } catch (error) {
      console.error("Promote user error:", error);
      showToast("Failed to promote user", "error");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newUser.name.trim() ||
      !newUser.email.trim() ||
      !newUser.password.trim()
    ) {
      showToast("All fields are required", "error");
      return;
    }
    if (!currentUser?.token) {
      showToast("Admin login required", "error");
      return;
    }

    try {
      const response = await apiFetch("/auth/users", {
        method: "POST",
        headers: buildHeaders(currentUser.token),
        body: JSON.stringify(newUser),
      });

      if (response && response.id) {
        showToast("User created successfully", "success");
        setUsers([...users, response]);
        setNewUser({ name: "", email: "", password: "", role: "CUSTOMER" });
        setShowCreateUserForm(false);
      }
    } catch (error) {
      console.error("Create user error:", error);
      showToast("Failed to create user", "error");
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!currentUser?.token) {
      showToast("Admin login required", "error");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await apiFetch(`/auth/users/${userId}`, {
        method: "DELETE",
        headers: buildHeaders(currentUser.token),
      });

      if (response && response.id) {
        showToast("User deleted successfully", "success");
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch (error) {
      console.error("Delete user error:", error);
      showToast("Failed to delete user", "error");
    }
  };

  // Admin-only access guard
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-24">
        <div className="text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Access Denied
          </h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            You don't have permission to access the admin dashboard. Only
            administrators can access this section.
          </p>
        </div>
      </div>
    );
  }

  const normalizeOrderStatus = (status: any): string => {
    if (!status) return "PENDING";
    const s = String(status).toUpperCase();
    const mapping: Record<string, string> = {
      PROCESSING: "PENDING",
      CONFIRMED: "PAID",
      SHIPPED: "SHIPPED",
      DELIVERED: "DELIVERED",
      CANCELLED: "CANCELLED",
      PENDING: "PENDING",
      PAID: "PAID",
    };
    return mapping[s] || "PENDING";
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string,
  ) => {
    if (!currentUser || !currentUser.token) {
      showToast("Admin login required", "error");
      return;
    }

    try {
      const response = await apiFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        headers: buildHeaders(currentUser.token),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response && (response.id || response._id)) {
        const statusMap: Record<string, string> = {
          PENDING: "Processing",
          PAID: "Confirmed",
          SHIPPED: "Shipped",
          DELIVERED: "Delivered",
          CANCELLED: "Cancelled",
        };
        updateOrderStatus(orderId, statusMap[newStatus] as any);
        showToast("Order status updated", "success");
      }
    } catch (error) {
      console.error("Update order status error:", error);
      showToast("Failed to update order status", "error");
    }
  };

  // New Product Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState({
    name: "",
    description: "",
    price: 0,
    category: categories[0] || "Dresses",
    stock: 10,
    images:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
  });

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const lowStock = products.filter((p) => p.stock < 10).length;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim()) {
      showToast("Product name is required", "error");
      return;
    }
    if (!currentUser || !currentUser.token) {
      showToast("Admin login required", "error");
      return;
    }

    try {
      const response = await apiFetch("/products", {
        method: "POST",
        headers: buildHeaders(currentUser.token),
        body: JSON.stringify({
          name: newProd.name,
          description: newProd.description,
          price: Number(newProd.price),
          category: newProd.category,
          stock: Number(newProd.stock),
          imageUrl: newProd.images,
        }),
      });

      if (response && (response.id || response._id)) {
        addProduct({
          id: response.id,
          _id: response._id || `p-${response.id}`,
          name: newProd.name,
          description: newProd.description,
          price: Number(newProd.price),
          category: newProd.category,
          stock: Number(newProd.stock),
          images: [newProd.images],
        } as any);

        setNewProd({
          name: "",
          description: "",
          price: 0,
          category: categories[0] || "Dresses",
          stock: 10,
          images:
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
        });
        setImageFile(null);
        setUploadError("");
        setShowAddForm(false);
        showToast("Product added successfully!", "success");
      }
    } catch (error) {
      console.error("Add product error:", error);
      showToast("Failed to add product. Please try again.", "error");
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      showToast("Select an image file first", "error");
      return;
    }
    if (!currentUser?.token) {
      showToast("Sign in as admin to upload images", "error");
      return;
    }

    setUploadingImage(true);
    setUploadError("");

    try {
      const signResponse = await fetch(
        `${API_BASE}/uploads/sign?filename=${encodeURIComponent(imageFile.name)}&contentType=${encodeURIComponent(imageFile.type)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        },
      );

      if (!signResponse.ok) {
        throw new Error("Failed to create upload URL");
      }

      const uploadData = await signResponse.json();
      const uploadResult = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": imageFile.type,
        },
        body: imageFile,
      });

      if (!uploadResult.ok) {
        throw new Error("Image upload failed");
      }

      setNewProd({ ...newProd, images: uploadData.assetUrl });
      setImageFile(null);
      showToast("Image uploaded successfully", "success");
    } catch (error) {
      setUploadError((error as Error).message || "Upload failed");
      showToast("Image upload failed", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleStartEdit = (prod: any) => {
    setEditingId(prod._id);
    setEditVals({ name: prod.name, price: prod.price, stock: prod.stock });
  };

  const handleSaveEdit = async (id: string) => {
    if (!currentUser || !currentUser.token) {
      showToast("Admin login required", "error");
      return;
    }

    try {
      const response = await apiFetch(`/products/${id}`, {
        method: "PATCH",
        headers: buildHeaders(currentUser.token),
        body: JSON.stringify({
          name: editVals.name,
          price: Number(editVals.price),
          stock: Number(editVals.stock),
        }),
      });

      if (response && (response.id || response._id)) {
        updateProduct(id, {
          name: editVals.name,
          price: Number(editVals.price),
          stock: Number(editVals.stock),
        });
        setEditingId(null);
        showToast("Product updated!", "success");
      }
    } catch (error) {
      console.error("Edit product error:", error);
      showToast("Failed to update product. Please try again.", "error");
    }
  };

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: TrendingUp },
    { id: "products" as const, label: "Products", icon: Package },
    { id: "categories" as const, label: "Categories", icon: FolderTree },
    { id: "orders" as const, label: "Orders", icon: ShoppingBag },
    { id: "users" as const, label: "Users", icon: Users },
  ];

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
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-500" /> Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your Aaiza Fashion store
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5 overflow-x-auto max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeSubTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Overview ─── */}
      {activeSubTab === "overview" && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Total Revenue",
                value: `₹${totalRevenue.toFixed(2)}`,
                change: "+12.5%",
                changeType: "positive" as const,
                icon: DollarSign,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-200",
              },
              {
                label: "Total Products",
                value: totalProducts.toString(),
                change: "+3",
                changeType: "positive" as const,
                icon: Package,
                color: "text-brand-600",
                bg: "bg-brand-50",
                border: "border-brand-200",
              },
              {
                label: "Total Orders",
                value: totalOrders.toString(),
                change: "+8.2%",
                changeType: "positive" as const,
                icon: ShoppingBag,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-200",
              },
              {
                label: "Low Stock Items",
                value: lowStock.toString(),
                change: lowStock > 0 ? "Action needed" : "All good",
                changeType:
                  lowStock > 0 ? ("warning" as const) : ("positive" as const),
                icon: Eye,
                color: lowStock > 0 ? "text-amber-600" : "text-emerald-600",
                bg: lowStock > 0 ? "bg-amber-50" : "bg-emerald-50",
                border:
                  lowStock > 0 ? "border-amber-200" : "border-emerald-200",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${stat.border}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      stat.changeType === "positive"
                        ? "bg-emerald-100 text-emerald-700"
                        : stat.changeType === "warning"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart Placeholder */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-500" /> Revenue Trend
              </h3>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Revenue Chart</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Coming soon with real data
                  </p>
                </div>
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-brand-500" /> Order
                Status
              </h3>
              <div className="space-y-3">
                {[
                  {
                    status: "Delivered",
                    count: orders.filter((o) => o.orderStatus === "Delivered")
                      .length,
                    color: "bg-emerald-500",
                  },
                  {
                    status: "Shipped",
                    count: orders.filter((o) => o.orderStatus === "Shipped")
                      .length,
                    color: "bg-blue-500",
                  },
                  {
                    status: "Processing",
                    count: orders.filter((o) =>
                      ["Processing", "Confirmed", "PENDING", "PAID"].includes(
                        o.orderStatus,
                      ),
                    ).length,
                    color: "bg-amber-500",
                  },
                  {
                    status: "Cancelled",
                    count: orders.filter((o) => o.orderStatus === "Cancelled")
                      .length,
                    color: "bg-rose-500",
                  },
                ].map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {item.status}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{
                            width: `${orders.length > 0 ? (item.count / orders.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-slate-900 w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-500" /> Recent Orders
              </h3>
            </div>
            {orders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No orders yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Orders will appear here once customers start shopping
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.slice(0, 8).map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-slate-900">
                          {order._id?.slice(-8) || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {order.shippingAddress?.fullName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          ₹{order.total?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-bold rounded-full border ${statusColor(order.orderStatus)}`}
                          >
                            {order.orderStatus || "PENDING"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          {lowStock > 0 && (
            <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-500" /> Low Stock Alert
              </h3>
              <div className="space-y-2">
                {products
                  .filter((p) => p.stock < 10)
                  .map((p) => (
                    <div
                      key={p._id}
                      className="flex justify-between items-center p-2 bg-amber-50 rounded-lg text-sm"
                    >
                      <span className="font-medium text-slate-900">
                        {p.name}
                      </span>
                      <span className="text-amber-700 font-bold">
                        {p.stock} left
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Products ─── */}
      {activeSubTab === "products" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-brand-500" /> Product
              Inventory
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
            >
              {showAddForm ? (
                <X className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}{" "}
              {showAddForm ? "Cancel" : "Add Product"}
            </button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddProduct}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-fade-in-up"
            >
              <h4 className="font-bold text-slate-900 mb-4">New Product</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    value={newProd.name}
                    onChange={(e) =>
                      setNewProd({ ...newProd, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newProd.description}
                    onChange={(e) =>
                      setNewProd({ ...newProd, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={newProd.category}
                    onChange={(e) =>
                      setNewProd({ ...newProd, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Price (₹)
                    </label>
                    <input
                      required
                      type="number"
                      value={newProd.price}
                      onChange={(e) =>
                        setNewProd({
                          ...newProd,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Stock
                    </label>
                    <input
                      required
                      type="number"
                      value={newProd.stock}
                      onChange={(e) =>
                        setNewProd({
                          ...newProd,
                          stock: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Upload Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700"
                  />
                  <div className="mt-3 flex flex-wrap gap-3 items-center">
                    <button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={!imageFile || uploadingImage}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
                    >
                      {uploadingImage ? "Uploading…" : "Upload Image"}
                    </button>
                    {newProd.images && (
                      <span className="text-xs text-slate-500 break-all">
                        Uploaded: {newProd.images}
                      </span>
                    )}
                  </div>
                  {uploadError && (
                    <p className="text-rose-500 text-xs mt-2">{uploadError}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={newProd.images}
                    onChange={(e) =>
                      setNewProd({ ...newProd, images: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-sm transition-all"
              >
                Add Product
              </button>
            </form>
          )}

          {/* Product List - Modern Data Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h4 className="font-bold text-slate-900">
                Product Inventory ({products.length})
              </h4>
              <div className="text-sm text-slate-500">
                {products.filter((p) => p.stock < 10).length} low stock items
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((prod) => {
                    const prodId = prod._id || prod.id || "p-" + Math.random();
                    const images =
                      prod.images || (prod.imageUrl ? [prod.imageUrl] : []);
                    const isLowStock = prod.stock < 10;
                    const isOutOfStock = prod.stock === 0;

                    return (
                      <tr
                        key={prodId}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={images[0]}
                              alt={prod.name}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/48x48/f1f5f9/94a3b8?text=Aaiza";
                              }}
                            />
                            <div>
                              {editingId === prodId ? (
                                <input
                                  type="text"
                                  value={editVals.name}
                                  onChange={(e) =>
                                    setEditVals({
                                      ...editVals,
                                      name: e.target.value,
                                    })
                                  }
                                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm text-slate-900 font-medium w-48"
                                />
                              ) : (
                                <div className="text-sm font-bold text-slate-900">
                                  {prod.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-bold rounded-full bg-brand-50 text-brand-700">
                            {prod.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          {editingId === prodId ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editVals.price}
                              onChange={(e) =>
                                setEditVals({
                                  ...editVals,
                                  price: e.target.value,
                                })
                              }
                              className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm text-slate-900"
                            />
                          ) : (
                            `₹${prod.price.toFixed(2)}`
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === prodId ? (
                            <input
                              type="number"
                              value={editVals.stock}
                              onChange={(e) =>
                                setEditVals({
                                  ...editVals,
                                  stock: e.target.value,
                                })
                              }
                              className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm text-slate-900"
                            />
                          ) : (
                            <span
                              className={`text-sm font-bold ${isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-emerald-600"}`}
                            >
                              {prod.stock}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-bold rounded-full border ${
                              isOutOfStock
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : isLowStock
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isOutOfStock
                              ? "Out of Stock"
                              : isLowStock
                                ? "Low Stock"
                                : "In Stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {editingId === prodId ? (
                              <button
                                onClick={() => handleSaveEdit(prodId)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                title="Save changes"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(prod)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                                title="Edit product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                deleteProduct(prodId);
                                showToast("Product deleted", "info");
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {products.length === 0 && (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No products yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add your first product to get started
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Categories ─── */}
      {activeSubTab === "categories" && (
        <div className="max-w-xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-brand-500" /> Manage Categories
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newCat.trim() && !categories.includes(newCat.trim())) {
                addCategory(newCat.trim());
                setNewCat("");
                showToast("Category added", "success");
              }
            }}
            className="flex gap-2 mb-6"
          >
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New category name..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
            />
            <button
              type="submit"
              className="px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-sm"
            >
              Add
            </button>
          </form>
          <div className="space-y-2">
            {categories
              .filter((c) => c !== "All")
              .map((cat) => (
                <div
                  key={cat}
                  className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg"
                >
                  <span className="text-sm text-slate-800 font-medium">
                    {cat}
                  </span>
                  <button
                    onClick={() => {
                      deleteCategory(cat);
                      showToast("Category deleted", "info");
                    }}
                    className="p-1.5 hover:bg-rose-50 text-rose-500 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ─── Orders ─── */}
      {activeSubTab === "orders" && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-500" /> Manage Orders
          </h3>
          {orders.length === 0 ? (
            <p className="text-slate-500">No orders yet</p>
          ) : (
            orders.map((order) => {
              const orderId = order._id || order.id || "ORD-" + Math.random();
              const normalizedStatus = normalizeOrderStatus(
                order.orderStatus || order.status,
              );
              return (
                <div
                  key={orderId}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-4"
                >
                  <div>
                    <span className="text-xs text-brand-600 font-mono font-bold block mb-1">
                      {orderId}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {order.shippingAddress.fullName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.country}
                    </p>
                    <span className="inline-block mt-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-xs font-mono text-slate-600">
                      ₹{order.total.toFixed(2)} • {order.items.length} items
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[150px] justify-center">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">
                      Update Status
                    </label>
                    <select
                      value={normalizedStatus}
                      onChange={(e) =>
                        handleUpdateOrderStatus(orderId, e.target.value)
                      }
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:border-brand-400"
                    >
                      <option value="PENDING">Processing</option>
                      <option value="PAID">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── Users ─── */}
      {activeSubTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500" /> User Management
            </h3>
            <button
              onClick={() => setShowCreateUserForm(!showCreateUserForm)}
              className="bg-brand-500 hover:bg-brand-600 text-white text-sm px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create User
            </button>
          </div>

          {showCreateUserForm && (
            <form
              onSubmit={handleCreateUser}
              className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPERADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUserForm(false)}
                  className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loadingUsers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
              <p className="text-slate-500 mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        {user.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {user.email}
                      </span>
                      <span className="text-xs text-slate-400 block">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        user.role === "SUPERADMIN"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : user.role === "ADMIN"
                            ? "bg-brand-50 text-brand-700 border border-brand-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {user.role}
                    </span>
                    {user.role === "CUSTOMER" && (
                      <button
                        onClick={() => handlePromoteToAdmin(user.id)}
                        className="bg-brand-500 hover:bg-brand-600 text-white text-xs px-3 py-1 rounded-md font-medium transition-colors"
                      >
                        Promote to Admin
                      </button>
                    )}
                    {user.role !== "SUPERADMIN" && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
