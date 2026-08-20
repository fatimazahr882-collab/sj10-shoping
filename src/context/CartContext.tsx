// src/context/CartContext.tsx
"use client";

import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/AuthProvider';

// --- TYPES ---
export type CartItem = {
  cart_item_id: number;
  quantity: number;
  product_id: string;
  title: string;
  price: string;
  profit?: number;
  image_urls: string[];
  options: any;
  delivery_fee?: number;
  system_commission?: number;
  supplier_id?: string | number | null; // 🟢 FIX: Added supplier_id
  supplier?: {                          // 🟢 FIX: Added supplier object
    id?: string | number | null;
    brand_name?: string;
  } | null;
};

export type AppliedCoupon = {
  code: string;
  discount: number;
  percentage?: number;
};

type AddToCartData = {
  options?: any;
  profit?: number;
};

type CartContextType = {
  cart: CartItem[];
  itemCount: number;
  totalPrice: number;
  isLoading: boolean;
  fetchCart: () => void;
  addItemToCart: (productId: string, quantity: number, data?: AddToCartData) => Promise<void>;
  removeItemFromCart: (cartItemId: number) => Promise<void>;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const cartData = await apiClient('cart', 'GET');
      setCart(cartData || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItemToCart = async (productId: string, quantity: number, data: AddToCartData = {}) => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      return;
    }
    try {
      const { options = {}, profit = 0 } = data;
      const payload = {
        productId,
        quantity,
        options,
        profit
      };
      
      await apiClient('cart', 'POST', payload);
      await fetchCart(); 
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      alert('There was an error adding the item to your cart.');
    }
  };

  const removeItemFromCart = async (cartItemId: number) => {
    if (!user) return;
    try {
      await apiClient(`cart/${cartItemId}`, 'DELETE');
      await fetchCart(); 
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  };

  const itemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const totalPrice = cart.reduce((total, item) => {
    const basePrice = parseFloat(item.price || '0');
    const profit = parseFloat((item.profit || 0).toString());
    const finalUnitPrice = basePrice + profit;
    return total + (finalUnitPrice * (item.quantity || 1));
  }, 0);

  const value = {
    cart,
    itemCount,
    totalPrice,
    isLoading,
    fetchCart,
    addItemToCart,
    removeItemFromCart,
    appliedCoupon,
    setAppliedCoupon
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};