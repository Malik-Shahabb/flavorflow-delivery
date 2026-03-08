import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, MenuItem, Order } from "@/data/restaurants";
import { supabase } from "@/integrations/supabase/client";

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  orders: Order[];
  currentOrder: Order | null;
  placeOrder: (deliveryFee: number) => void;
  advanceOrderStatus: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addItem = useCallback((item: MenuItem, restaurantId: string, restaurantName: string) => {
    setItems((prev) => {
      if (prev.length > 0 && prev[0].restaurantId !== restaurantId) {
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
    async (deliveryFee: number) => {
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const restaurantId = items[0]?.restaurantId || "";
      const restaurantName = items[0]?.restaurantName || "";
      const total = subtotal + deliveryFee;

      const order: Order = {
        id: orderId,
        items: [...items],
        total,
        status: "confirmed",
        restaurantName,
        estimatedDelivery: "30-40 min",
        createdAt: new Date(),
      };

      setOrders((prev) => [order, ...prev]);
      setItems([]);

      // Persist order and create notification in background
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user profile for customer name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        const customerName = profile?.full_name || user.email || "Customer";

        // Insert the order
        const { data: dbOrder } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId,
            restaurant_name: restaurantName,
            items: items.map((ci) => ({
              menuItem: ci.menuItem,
              quantity: ci.quantity,
              restaurantId: ci.restaurantId,
              restaurantName: ci.restaurantName,
            })) as any,
            subtotal,
            delivery_fee: deliveryFee,
            total,
            status: "confirmed",
          })
          .select("id")
          .single();

        if (!dbOrder) return;

        // Update local order with DB-generated ID
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, dbOrderId: dbOrder.id } : o
          )
        );

        // Find restaurant owner and create notification
        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("owner_id")
          .eq("id", restaurantId)
          .maybeSingle();

        if (restaurant?.owner_id) {
          await supabase.from("order_notifications").insert({
            owner_id: restaurant.owner_id,
            order_id: dbOrder.id,
            restaurant_name: restaurantName,
            customer_name: customerName,
            total,
          });
        }
      } catch (err) {
        console.error("Failed to persist order:", err);
      }
    },
    [items, subtotal]
  );

  const advanceOrderStatus = useCallback(() => {
    setOrders((prev) => {
      if (prev.length === 0) return prev;
      const latest = prev[0];
      const flow: Order["status"][] = ["confirmed", "preparing", "out-for-delivery", "delivered"];
      const idx = flow.indexOf(latest.status);
      if (idx < flow.length - 1) {
        return [{ ...latest, status: flow[idx + 1] }, ...prev.slice(1)];
      }
      return prev;
    });
  }, []);

  const currentOrder = orders.length > 0 ? orders[0] : null;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, orders, currentOrder, placeOrder, advanceOrderStatus }}
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
