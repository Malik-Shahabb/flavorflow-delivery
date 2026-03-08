import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, ChefHat, Truck, CheckCircle2 } from "lucide-react";
import ReviewDialog from "@/components/ReviewDialog";
import DeliveryRatingDialog from "@/components/DeliveryRatingDialog";
import { OrderListSkeleton } from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const steps = [
  { status: "confirmed", label: "Order Confirmed", icon: Package },
  { status: "preparing", label: "Preparing", icon: ChefHat },
  { status: "out-for-delivery", label: "Out for Delivery", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

interface DbOrder {
  id: string;
  status: string;
  restaurant_name: string;
  items: any;
  total: number;
  created_at: string;
}

const OrdersPage = () => {
  const { user } = useAuth();
  const { orders: localOrders } = useCart();
  const [dbOrders, setDbOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from DB
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDbOrders((data as DbOrder[]) || []);
      setLoading(false);
    };

    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("user-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setDbOrders((prev) =>
              prev.map((o) =>
                o.id === (payload.new as DbOrder).id
                  ? (payload.new as DbOrder)
                  : o
              )
            );
          } else if (payload.eventType === "INSERT") {
            setDbOrders((prev) => [payload.new as DbOrder, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Order advancement now runs globally in CartContext

  // Merge: show DB orders + local orders that don't have a dbOrderId (static restaurant orders)
  const allOrders = [
    ...dbOrders.map((o) => ({
      id: o.id,
      dbOrderId: o.id,
      status: o.status as "confirmed" | "preparing" | "out-for-delivery" | "delivered",
      restaurantName: o.restaurant_name,
      items: Array.isArray(o.items) ? o.items : [],
      total: o.total,
      createdAt: new Date(o.created_at),
    })),
    ...localOrders.filter((lo) => !lo.dbOrderId),
  ];

  if (loading) {
    return (
      <div className="min-h-screen pb-16">
        <div className="container max-w-2xl py-8">
          <h1 className="font-serif text-3xl text-foreground">My Orders</h1>
          <div className="mt-8">
            <OrderListSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <div className="min-h-screen pb-16">
        <EmptyState type="orders" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="container max-w-2xl py-8">
        <h1 className="font-serif text-3xl text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">{allOrders.length} order{allOrders.length > 1 ? "s" : ""}</p>

        <div className="mt-8 space-y-6">
          {allOrders.map((order) => {
            const currentIdx = steps.findIndex((s) => s.status === order.status);

            return (
              <div key={order.id} className="rounded-xl border border-border bg-card p-4 space-y-4 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-serif text-base text-card-foreground sm:text-lg">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-muted-foreground">{order.restaurantName}</p>
                  </div>
                  <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${
                    order.status === "delivered"
                      ? "bg-success/10 text-success"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {steps.find((s) => s.status === order.status)?.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex gap-1">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${i <= currentIdx ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((ci: any, idx: number) => (
                    <div key={ci.menuItem?.id || idx} className="flex justify-between text-sm">
                      <span className="text-card-foreground">
                        {ci.quantity}x {ci.menuItem?.name || "Item"}
                      </span>
                      <span className="text-muted-foreground">
                        ₹{((ci.menuItem?.price || 0) * ci.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between font-bold text-card-foreground">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Auto-advancing notice for non-delivered */}
                {order.status !== "delivered" && (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="absolute inset-0 h-full w-1/3 rounded-full bg-primary animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Updating…</span>
                  </div>
                )}

                {order.status === "delivered" && (
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-success">🎉 Delivered!</p>
                    <div className="flex gap-2">
                      <DeliveryRatingDialog orderId={order.id} />
                      {order.dbOrderId ? (
                        <ReviewDialog
                          orderId={order.dbOrderId}
                          restaurantId={order.items[0]?.restaurantId || ""}
                          restaurantName={order.restaurantName}
                        />
                      ) : (
                        <p className="text-xs text-muted-foreground">Review unavailable</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
