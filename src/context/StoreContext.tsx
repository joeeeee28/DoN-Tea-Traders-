import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { BlogPost, CartItem, Category, Product, ProductVariant, StoreSettings } from '../types';

interface StoreContextValue {
  settings: StoreSettings | null;
  categories: Category[];
  featuredProducts: Product[];
  blogPosts: BlogPost[];
  loading: boolean;
  error: string | null;
  refreshStorefront: () => Promise<void>;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  hasUnpricedCartItems: boolean;
  totalCartWeightGrams: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateCartQuantity: (variantId: number, quantity: number) => void;
  removeFromCart: (variantId: number) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = 'don_traders_cart_v1';

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota issues
    }
  }, [cart]);

  const refreshStorefront = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/storefront');
      if (!res.ok) throw new Error('Unable to load storefront data.');
      const data = await res.json();
      setSettings(data.settings);
      setCategories(data.categories || []);
      setFeaturedProducts(data.featuredProducts || []);
      setBlogPosts(data.blogPosts || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading store');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStorefront();
  }, [refreshStorefront]);

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    const unitPrice = variant.sellingPrice !== null ? Number(variant.sellingPrice) : null;
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.variantId === variant.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          imageUrl: product.images[0] || '',
          variantId: variant.id,
          sku: variant.sku,
          packSize: variant.packSize,
          unitPrice,
          currency: variant.currency || 'INR',
          shippingWeightGrams: variant.shippingWeightGrams,
          quantity,
          isDemo: product.isDemo,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (variantId: number) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + (item.unitPrice !== null ? item.unitPrice * item.quantity : 0),
    0
  );
  const hasUnpricedCartItems = cart.some((item) => item.unitPrice === null);
  const totalCartWeightGrams = cart.reduce(
    (acc, item) => acc + item.shippingWeightGrams * item.quantity,
    0
  );

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        featuredProducts,
        blogPosts,
        loading,
        error,
        refreshStorefront,
        cart,
        cartCount,
        cartSubtotal,
        hasUnpricedCartItems,
        totalCartWeightGrams,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
