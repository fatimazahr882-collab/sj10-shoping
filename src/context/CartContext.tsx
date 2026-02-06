// src/context/CartContext.tsx (FULLY UPDATED AND FIXED)
"use client";

import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';
import apiClient from '@/lib/apiClient'; // Our new API client
import { useAuth } from '@/components/AuthProvider'; // Our new Auth context

// --- TYPES (UPDATED) ---

// 1. Updated the CartItem type to include the 'profit' field
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
  system_commission?: number; // ✅ Added this
};

// 2. Defined a clear type for the data sent when adding an item
type AddToCartData = {
  options?: any;
  profit?: number;
};

// 3. Updated the context type for the new addItemToCart function
type CartContextType = {
  cart: CartItem[];
  itemCount: number;
  totalPrice: number; // This will now be accurately calculated
  isLoading: boolean;
  fetchCart: () => void;
  addItemToCart: (productId: string, quantity: number, data?: AddToCartData) => Promise<void>;
  removeItemFromCart: (cartItemId: number) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // This now fetches the cart with the 'profit' field from your fixed backend
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

  // --- addItemToCart (THE MAIN FIX) ---
  // 4. This function now correctly separates profit from options and sends both to the backend.
  const addItemToCart = async (productId: string, quantity: number, data: AddToCartData = {}) => {
    if (!user) {
      alert('Please log in to add items to your cart.');
      return;
    }
    try {
      // Safely extract options and profit from the data object
      const { options = {}, profit = 0 } = data;

      // This payload matches what your new backend controller expects
      const payload = {
        productId,
        quantity,
        options,
        profit
      };
       // --- THIS IS THE DEBUGGING LINE ---
      console.log('--- Sending to Backend ---', payload);
      // ------------------------------------npm run dev
      await apiClient('cart', 'POST', payload);
      
      // After adding, refresh the cart to get the latest state from the server
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

  // --- CALCULATIONS (THE SECONDARY FIX) ---

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // 5. This now recalculates the total price on the client-side, guaranteeing it's correct.
  // It ignores any 'subtotal' from the DB and uses the real formula.
  const totalPrice = cart.reduce((total, item) => {
    const basePrice = parseFloat(item.price || '0');
    const profit = parseFloat((item.profit || 0).toString());
    const finalUnitPrice = basePrice + profit;
    
    return total + (finalUnitPrice * item.quantity);
  }, 0);

  // --- PROVIDER VALUE ---
  const value = {
    cart,
    itemCount,
    totalPrice, // Provide the newly calculated, accurate total price
    isLoading,
    fetchCart,
    addItemToCart,
    removeItemFromCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};