import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiFetch, buildHeaders, API_BASE } from "../utils/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Product {
  id?: number;
  _id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  stock: number;
  images: string[];
  imageUrl?: string;
  rating: number;
  reviewsCount: number;
  reviews: {
    id: string;
    user: string;
    text: string;
    rating: number;
    date: string;
  }[];
  isNew?: boolean;
  isBestseller?: boolean;
  sizes?: string[];
  colors?: string[];
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id?: number;
  _id?: string;
  items: CartItem[];
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentStatus:
    | "pending"
    | "completed"
    | "failed"
    | "PENDING"
    | "PAID"
    | "FAILED";
  orderStatus:
    | "Processing"
    | "Confirmed"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "PENDING"
    | "PAID"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  createdAt: string;
  paymentMethod: string;
  status?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  token: string;
  joinedDate: string;
  avatar?: string;
}

interface AppContextType {
  products: Product[];
  categories: string[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  currentUser: User | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addProduct: (
    product: Omit<Product, "_id" | "rating" | "reviewsCount" | "reviews">,
  ) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (cat: string) => void;
  deleteCategory: (cat: string) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    size?: string,
    color?: string,
  ) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateCartQuantity: (
    productId: string,
    size?: string,
    color?: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  placeOrder: (
    shippingDetails: Order["shippingAddress"],
    paymentMethod: string,
  ) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: Order["orderStatus"]) => void;
  login: (
    email: string,
    name: string,
    role: "user" | "admin",
    password?: string,
  ) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_PREFIX = "aaiza_";

// ─── Seed Data ───────────────────────────────────────────────────────────────

const initialProducts: Product[] = [
  {
    _id: "p1",
    name: "Silk Embroidered Maxi Dress",
    description:
      "Elegant floor-length maxi dress crafted from pure silk with delicate hand-embroidered floral motifs. Features a flattering A-line silhouette and hidden back zipper.",
    price: 15999.0,
    originalPrice: 20999.0,
    category: "Dresses",
    subcategory: "Maxi",
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600&h=800",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400&h=600",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=500&h=700",
    ],
    rating: 4.9,
    reviewsCount: 87,
    isNew: true,
    isBestseller: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Burgundy", "Navy", "Emerald"],
    reviews: [
      {
        id: "r1",
        user: "Ayesha K.",
        text: "Absolutely stunning! The embroidery is exquisite and the silk drapes beautifully. Received so many compliments.",
        rating: 5,
        date: "2026-01-15",
      },
      {
        id: "r2",
        user: "Maria S.",
        text: "Perfect for formal occasions. True to size and the quality is outstanding.",
        rating: 5,
        date: "2026-01-10",
      },
    ],
  },
  {
    _id: "p2",
    name: "Tailored Wool Blend Blazer",
    description:
      "Sophisticated single-breasted blazer in premium Italian wool blend. Features notch lapels, double-vented back, and fully lined interior for a polished finish.",
    price: 22999.0,
    category: "Outerwear",
    subcategory: "Blazers",
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600&h=800",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=500&h=700",
    ],
    rating: 4.8,
    reviewsCount: 56,
    isBestseller: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal", "Camel", "Black"],
    reviews: [
      {
        id: "r3",
        user: "James L.",
        text: "Incredible tailoring. Fits like a glove and the wool blend is incredibly comfortable.",
        rating: 5,
        date: "2026-01-20",
      },
    ],
  },
  {
    _id: "p3",
    name: "Cashmere Oversized Sweater",
    description:
      "Luxuriously soft 100% Grade-A Mongolian cashmere sweater in a relaxed oversized fit. Features ribbed cuffs and hem with a classic crew neckline.",
    price: 13999.0,
    originalPrice: 17999.0,
    category: "Knitwear",
    subcategory: "Sweaters",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=750&h=950",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=650&h=850",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=550&h=750",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=450&h=650",
    ],
    rating: 4.7,
    reviewsCount: 124,
    isNew: true,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Cream", "Dusty Rose", "Sage", "Black"],
    reviews: [
      {
        id: "r4",
        user: "Sarah M.",
        text: "So soft and cozy! Worth every penny. The oversized fit is exactly what I wanted.",
        rating: 5,
        date: "2026-01-18",
      },
      {
        id: "r5",
        user: "Elena P.",
        text: "Beautiful cashmere quality. Runs slightly large so consider sizing down.",
        rating: 4,
        date: "2026-01-05",
      },
    ],
  },
  {
    _id: "p4",
    name: "High-Waist Wide Leg Trousers",
    description:
      "Modern wide-leg trousers with a flattering high-rise waist. Made from breathable crepe fabric with a flowing drape and side pockets.",
    price: 8499.0,
    category: "Bottoms",
    subcategory: "Trousers",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=600&h=800",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=500&h=700",
    ],
    rating: 4.6,
    reviewsCount: 93,
    sizes: ["24", "26", "28", "30", "32"],
    colors: ["Black", "White", "Olive", "Navy"],
    reviews: [
      {
        id: "r6",
        user: "Diana R.",
        text: "Love the wide-leg style! So comfortable and elegant. Perfect for office and weekends.",
        rating: 5,
        date: "2026-01-12",
      },
    ],
  },
  {
    _id: "p5",
    name: "Leather Crossbody Bag",
    description:
      "Handcrafted Italian leather crossbody bag with adjustable strap. Features gold-tone hardware, magnetic closure, and multiple interior compartments.",
    price: 320.0,
    category: "Accessories",
    subcategory: "Bags",
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=750&h=950",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=650&h=850",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=550&h=750",
    ],
    rating: 4.9,
    reviewsCount: 42,
    isBestseller: true,
    colors: ["Tan", "Black", "Burgundy"],
    reviews: [
      {
        id: "r7",
        user: "Luna W.",
        text: "Exquisite craftsmanship. The leather gets even more beautiful with time. A timeless investment piece.",
        rating: 5,
        date: "2026-01-22",
      },
    ],
  },
  {
    _id: "p6",
    name: "Satin Wrap Blouse",
    description:
      "Effortlessly chic satin wrap blouse with a V-neckline and self-tie waist. The lustrous fabric drapes beautifully for an elegant silhouette.",
    price: 79.99,
    originalPrice: 110.0,
    category: "Tops",
    subcategory: "Blouses",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&q=80&w=600&h=800",
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&q=80&w=500&h=700",
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&q=80&w=400&h=600",
    ],
    rating: 4.5,
    reviewsCount: 68,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Champagne", "Black", "Blush", "Emerald"],
    reviews: [
      {
        id: "r8",
        user: "Priya M.",
        text: "The wrap style is so flattering! Pairs well with jeans or formal skirts.",
        rating: 4,
        date: "2026-01-08",
      },
    ],
  },
  {
    _id: "p7",
    name: "Floral Print Midi Skirt",
    description:
      "Romantic A-line midi skirt in a vibrant botanical print. Features an elasticated waist, soft pleats, and a gentle movement that catches the light.",
    price: 68.0,
    category: "Bottoms",
    subcategory: "Skirts",
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=750&h=950",
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=650&h=850",
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=550&h=750",
    ],
    rating: 4.7,
    reviewsCount: 51,
    isNew: true,
    sizes: ["XS", "S", "M", "L"],
    reviews: [
      {
        id: "r9",
        user: "Olivia T.",
        text: "The print is even more gorgeous in person! Perfect for spring and summer occasions.",
        rating: 5,
        date: "2026-01-25",
      },
    ],
  },
  {
    _id: "p8",
    name: "Minimalist Gold Hoop Earrings",
    description:
      "Classic 14k gold-plated hoop earrings with a polished finish. Lightweight and hypoallergenic, perfect for everyday elegance.",
    price: 45.0,
    category: "Accessories",
    subcategory: "Jewelry",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600&h=800",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=500&h=700",
    ],
    rating: 4.8,
    reviewsCount: 215,
    isBestseller: true,
    reviews: [
      {
        id: "r10",
        user: "Nina F.",
        text: "My go-to everyday earrings. They look so much more expensive than they are!",
        rating: 5,
        date: "2026-01-28",
      },
    ],
  },
  {
    _id: "p9",
    name: "Structured Trench Coat",
    description:
      "Timeless double-breasted trench coat in water-resistant cotton gabardine. Features classic epaulettes, belt, and gun flap detail.",
    price: 345.0,
    originalPrice: 450.0,
    category: "Outerwear",
    subcategory: "Coats",
    stock: 6,
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=750&h=950",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=650&h=850",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=550&h=750",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=450&h=650",
    ],
    rating: 4.9,
    reviewsCount: 37,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Khaki", "Navy"],
    reviews: [
      {
        id: "r11",
        user: "Catherine B.",
        text: "An absolute wardrobe staple. Classic design that will never go out of style.",
        rating: 5,
        date: "2026-01-14",
      },
    ],
  },
  {
    _id: "p10",
    name: "Linen Summer Jumpsuit",
    description:
      "Effortless linen jumpsuit with a relaxed fit, wide legs, and adjustable shoulder straps. Features side pockets and a tie-waist detail.",
    price: 125.0,
    category: "Dresses",
    subcategory: "Jumpsuits",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600&h=800",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=500&h=700",
    ],
    rating: 4.6,
    reviewsCount: 78,
    isNew: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Terracotta", "Sage"],
    reviews: [
      {
        id: "r12",
        user: "Zara H.",
        text: "So comfortable and stylish! Perfect for hot summer days. Linen quality is excellent.",
        rating: 4,
        date: "2026-01-30",
      },
    ],
  },
  {
    _id: "p11",
    name: "Designer Sunglasses Collection",
    description:
      "Oversized cat-eye sunglasses with UV400 protection lenses and acetate frames. Comes with a luxury carrying case and cleaning cloth.",
    price: 89.0,
    category: "Accessories",
    subcategory: "Eyewear",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=700&h=900",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600&h=800",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=500&h=700",
    ],
    rating: 4.5,
    reviewsCount: 156,
    colors: ["Tortoise", "Black", "Rose Gold"],
    reviews: [
      {
        id: "r13",
        user: "Maya J.",
        text: "Love the retro vibe! Great UV protection and so many compliments.",
        rating: 5,
        date: "2026-01-16",
      },
    ],
  },
  {
    _id: "p12",
    name: "Merino Wool Turtleneck",
    description:
      "Fine-gauge merino wool turtleneck in a slim-fit silhouette. Breathable, temperature-regulating fabric perfect for layering.",
    price: 110.0,
    category: "Knitwear",
    subcategory: "Turtlenecks",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cda3a38?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1434389677669-e08b4cda3a38?auto=format&fit=crop&q=80&w=750&h=950",
      "https://images.unsplash.com/photo-1434389677669-e08b4cda3a38?auto=format&fit=crop&q=80&w=650&h=850",
      "https://images.unsplash.com/photo-1434389677669-e08b4cda3a38?auto=format&fit=crop&q=80&w=550&h=750",
    ],
    rating: 4.7,
    reviewsCount: 89,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Ivory", "Camel", "Navy"],
    reviews: [
      {
        id: "r14",
        user: "Anna V.",
        text: "Super soft and not itchy at all. Perfect weight for layering under blazers.",
        rating: 5,
        date: "2026-01-19",
      },
    ],
  },
];

const initialCategories = [
  "All",
  "Dresses",
  "Outerwear",
  "Knitwear",
  "Bottoms",
  "Tops",
  "Accessories",
];

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State with lazy initialization from localStorage (fallback)
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + "categories");
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + "cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + "wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + "user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products from API...");
        const response = await apiFetch("/products", {
          method: "GET",
          headers: buildHeaders(undefined),
        });

        console.log("API Response:", response);
        let productsData: Product[] = [];
        if (Array.isArray(response)) {
          productsData = response;
        } else if (response.data) {
          productsData = response.data;
        }

        console.log("Products data:", productsData);
        // If backend returns no products, fall back to built-in seed products
        if (productsData.length === 0) {
          console.warn(
            "No products returned from API, falling back to built-in products.",
          );
          productsData = initialProducts;
        }

        // Transform backend data to match frontend format
        const transformedProducts = productsData.map((product) => ({
          ...product,
          _id: product._id || `p${product.id}`,
          images: product.images || [product.imageUrl || ""],
          rating: product.rating || 4.5,
          reviewsCount: product.reviewsCount || 0,
          reviews: product.reviews || [],
        }));

        console.log("Transformed products:", transformedProducts);
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Fetch products failed, using initial products:", error);
        // If backend unavailable, use initial products
        setProducts(initialProducts);
      } finally {
        setProductsLoaded(true);
      }
    };
    fetchProducts();
  }, []);

  // Fetch user orders from backend when currentUser changes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser || !currentUser.token) {
        setOrdersLoaded(true);
        return;
      }
      try {
        const response = await apiFetch("/orders", {
          method: "GET",
          headers: buildHeaders(currentUser.token),
        });
        if (Array.isArray(response)) {
          setOrders(response);
        } else if (response.data) {
          setOrders(response.data);
        }
      } catch {
        // If backend unavailable, keep local orders
        setOrders([]);
      } finally {
        setOrdersLoaded(true);
      }
    };
    fetchOrders();
  }, [currentUser]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_PREFIX + "products",
        JSON.stringify(products),
      );
    } catch {
      /* ignore */
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_PREFIX + "categories",
        JSON.stringify(categories),
      );
    } catch {
      /* ignore */
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + "cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_PREFIX + "wishlist",
        JSON.stringify(wishlist),
      );
    } catch {
      /* ignore */
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + "orders", JSON.stringify(orders));
    } catch {
      /* ignore */
    }
  }, [orders]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(
          STORAGE_PREFIX + "user",
          JSON.stringify(currentUser),
        );
      } else {
        localStorage.removeItem(STORAGE_PREFIX + "user");
      }
    } catch {
      /* ignore */
    }
  }, [currentUser]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const addProduct = useCallback(
    (prod: Omit<Product, "_id" | "rating" | "reviewsCount" | "reviews">) => {
      const newProduct: Product = {
        ...prod,
        _id: "p" + Date.now(),
        rating: 0,
        reviewsCount: 0,
        reviews: [],
      };
      setProducts((prev) => [...prev, newProduct]);
    },
    [],
  );

  const updateProduct = useCallback((id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, ...updated } : p)),
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== id));
  }, []);

  const addCategory = useCallback((cat: string) => {
    setCategories((prev) => (prev.includes(cat) ? prev : [...prev, cat]));
  }, []);

  const deleteCategory = useCallback((cat: string) => {
    if (cat === "All") return;
    setCategories((prev) => prev.filter((c) => c !== cat));
  }, []);

  const addToCart = useCallback(
    (product: Product, quantity = 1, size?: string, color?: string) => {
      setCart((prev) => {
        const key = `${product._id}-${size}-${color}`;
        const exists = prev.find(
          (item) =>
            `${item._id}-${item.selectedSize}-${item.selectedColor}` === key,
        );
        if (exists) {
          return prev.map((item) => {
            const itemKey = `${item._id}-${item.selectedSize}-${item.selectedColor}`;
            return itemKey === key
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + quantity, product.stock),
                }
              : item;
          });
        }
        return [
          ...prev,
          { ...product, quantity, selectedSize: size, selectedColor: color },
        ];
      });
    },
    [],
  );

  const removeFromCart = useCallback(
    (productId: string, size?: string, color?: string) => {
      const key = `${productId}-${size || ""}-${color || ""}`;
      setCart((prev) =>
        prev.filter(
          (item) =>
            `${item._id}-${item.selectedSize || ""}-${item.selectedColor || ""}` !==
            key,
        ),
      );
    },
    [],
  );

  const updateCartQuantity = useCallback(
    (productId: string, size?: string, color?: string, quantity: number) => {
      const key = `${productId}-${size || ""}-${color || ""}`;
      if (quantity <= 0) {
        setCart((prev) =>
          prev.filter(
            (item) =>
              `${item._id}-${item.selectedSize || ""}-${item.selectedColor || ""}` !==
              key,
          ),
        );
        return;
      }
      setCart((prev) =>
        prev.map((item) => {
          const itemKey = `${item._id}-${item.selectedSize || ""}-${item.selectedColor || ""}`;
          if (itemKey === key) {
            const product =
              initialProducts.find((p) => p._id === productId) ||
              products.find((p) => p._id === productId);
            const maxQty = product?.stock ?? 99;
            return { ...item, quantity: Math.min(quantity, maxQty) };
          }
          return item;
        }),
      );
    },
    [products],
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const placeOrder = useCallback(
    async (
      shippingDetails: Order["shippingAddress"],
      paymentMethod: string,
    ): Promise<boolean> => {
      if (!currentUser || !currentUser.token) {
        console.warn("User not logged in");
        return false;
      }

      try {
        const orderItems = cart.map((item) => ({
          productId: Number(item.id || item._id) || 0,
          quantity: item.quantity,
        }));

        const response = await apiFetch("/orders", {
          method: "POST",
          headers: buildHeaders(currentUser.token),
          body: JSON.stringify({
            items: orderItems,
            paymentMethod,
          }),
        });

        if (response && (response.id || response._id)) {
          // Update local state with new order
          const newOrder: Order = {
            ...response,
            _id: response._id || `ORD-${response.id}`,
            items: cart,
            subtotal: cart.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0,
            ),
            tax:
              Math.round(
                cart.reduce(
                  (acc, item) => acc + item.price * item.quantity,
                  0,
                ) *
                  0.08 *
                  100,
              ) / 100,
            shipping:
              cart.reduce((acc, item) => acc + item.price * item.quantity, 0) >
              100
                ? 0
                : 12.99,
            shippingAddress: shippingDetails,
            createdAt: response.createdAt || new Date().toISOString(),
          };

          setOrders((prev) => [newOrder, ...prev]);

          // Decrease stock in local products
          setProducts((prev) =>
            prev.map((p) => {
              const cartItem = cart.find(
                (c) => Number(c.id || c._id) === Number(p.id || p._id),
              );
              if (cartItem) {
                return {
                  ...p,
                  stock: Math.max(0, p.stock - cartItem.quantity),
                };
              }
              return p;
            }),
          );

          clearCart();
          return true;
        }
      } catch (error) {
        console.error("Order creation failed:", error);
      }

      return false;
    },
    [cart, currentUser, clearCart],
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order["orderStatus"]) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: status } : order,
        ),
      );
    },
    [],
  );

  const login = useCallback(
    async (
      email: string,
      name: string,
      role: "user" | "admin",
      password?: string,
    ) => {
      if (!password || password.length === 0) {
        throw new Error("Password is required for login");
      }

      try {
        const response = await apiFetch("/auth/login", {
          method: "POST",
          headers: buildHeaders(undefined),
          body: JSON.stringify({ email, password }),
        });

        if (response.access_token && response.user) {
          const user: User = {
            _id: `u-${response.user.id}`,
            name: response.user.name ?? name,
            email: response.user.email,
            role: (response.user.role ?? "CUSTOMER")
              .toLowerCase()
              .includes("admin")
              ? "admin"
              : "user",
            token: response.access_token,
            joinedDate: new Date().toISOString(),
          };
          setCurrentUser(user);
          return user; // Return the user so components can use it immediately
        } else {
          throw new Error("Invalid login response");
        }
      } catch (error) {
        console.error("Login error:", error);
        throw error; // Re-throw to let the UI handle the error
      }
    },
    [],
  );

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      try {
        const response = await apiFetch("/auth/register", {
          method: "POST",
          headers: buildHeaders(undefined),
          body: JSON.stringify({ email, name, password }),
        });

        if (response.access_token && response.user) {
          const user: User = {
            _id: `u-${response.user.id}`,
            name: response.user.name ?? name,
            email: response.user.email,
            role: (response.user.role ?? "CUSTOMER")
              .toLowerCase()
              .includes("admin")
              ? "admin"
              : "user",
            token: response.access_token,
            joinedDate: new Date().toISOString(),
          };
          setCurrentUser(user);
        } else {
          throw new Error("Invalid registration response");
        }
      } catch (error) {
        console.error("Registration error:", error);
        throw error; // Re-throw to let the UI handle the error
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        products,
        categories,
        cart,
        wishlist,
        orders,
        currentUser,
        searchQuery,
        setSearchQuery,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        deleteCategory,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        placeOrder,
        updateOrderStatus,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
