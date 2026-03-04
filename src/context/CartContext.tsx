import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, MenuItem, Order } from "@/data/restaurants";

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  currentOrder: Order | null;
  placeOrder: (deliveryFee: number) => void;
  advanceOrderStatus: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const addItem = useCallback((item: MenuItem, restaurantId: string, restaurantName: string) => {
    setItems((prev) => {
      // Check if adding from a different restaurant
      if (prev.length > 0 && prev[0].restaurantId !== restaurantId) {
        // Clear cart and add new item
        return [{ menuItem: item, quantity: 1, restaurantId, restaurantName }];
      }
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { menuItem: item, quantity: 1, restaurantId, restaurantName }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
    } else {
      setItems((prev) =>
        prev.map((ci) => (ci.menuItem.id === itemId ? { ...ci, quantity } : ci))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const subtotal = items.reduce((sum, ci) => sum + ci.menuItem.price * ci.quantity, 0);

  const placeOrder = useCallback(
    (deliveryFee: number) => {
      const order: Order = {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        items: [...items],
        total: subtotal + deliveryFee,
        status: "confirmed",
        restaurantName: items[0]?.restaurantName || "",
        estimatedDelivery: "30-40 min",
        createdAt: new Date(),
      };
      setCurrentOrder(order);
      setItems([]);
    },
    [items, subtotal]
  );

  const advanceOrderStatus = useCallback(() => {
    setCurrentOrder((prev) => {
      if (!prev) return null;
      const flow: Order["status"][] = ["confirmed", "preparing", "out-for-delivery", "delivered"];
      const idx = flow.indexOf(prev.status);
      if (idx < flow.length - 1) {
        return { ...prev, status: flow[idx + 1] };
      }
      return prev;
    });
  }, []);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, currentOrder, placeOrder, advanceOrderStatus }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
