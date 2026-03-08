import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useRestaurant } from "@/hooks/useRestaurants";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Package, ChefHat, Truck, CheckCircle2 } from "lucide-react";

const statusSteps = [
  { status: "confirmed", label: "Confirmed", icon: Package },
  { status: "preparing", label: "Preparing", icon: ChefHat },
  { status: "out-for-delivery", label: "Out for Delivery", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

type OrderStatus = typeof statusSteps[number]["status"];

interface OrderRow {
  id: string;
  user_id: string;
  status: string;
  items: any;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  restaurant_name: string;
  restaurant_id: string;
}

const OwnerOrdersPage = () => {
  const { id } = useParams();
  const { user, isReady } = useAuth();
  const { data: restaurant, isLoading: loadingRestaurant } = useRestaurant(id);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
      } else {
        setOrders((data as OrderRow[]) || []);
      }
      setLoading(false);
    };
    fetchOrders();

    // Realtime subscription for new orders
    const channel = supabase
      .channel(`owner-orders-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${id}` }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user]);

  const advanceStatus = async (orderId: string, currentStatus: string) => {
    const idx = statusSteps.findIndex((s) => s.status === currentStatus);
    if (idx < 0 || idx >= statusSteps.length - 1) return;
    const nextStatus = statusSteps[idx + 1].status;
    setUpdating(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", orderId);
      if (error) throw error;
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o));
      toast.success(`Order updated to "${statusSteps[idx + 1].label}"`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    } finally {
      setUpdating(null);
    }
  };

  if (!isReady || loadingRestaurant || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!user || !restaurant || restaurant.owner_id !== user.id) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Access denied.</p>
        <Link to="/owner-dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-card border-b border-border py-8">
        <div className="container">
          <Link to="/owner-dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="font-serif text-3xl text-foreground">Orders: {restaurant.name}</h1>
          <p className="mt-1 text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="container mt-8 max-w-3xl space-y-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground/40" />
            <h2 className="mt-4 font-serif text-2xl text-foreground">No orders yet</h2>
            <p className="mt-2 text-muted-foreground">Orders from customers will appear here in real-time.</p>
          </div>
        ) : (
          orders.map((order) => {
            const currentIdx = statusSteps.findIndex((s) => s.status === order.status);
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <div key={order.id} className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-card-foreground">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {statusSteps.find((s) => s.status === order.status)?.label || order.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex gap-1">
                  {statusSteps.map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= currentIdx ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {items.map((ci: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-card-foreground">
                        {ci.quantity || 1}x {ci.menuItem?.name || ci.name || "Item"}
                      </span>
                      <span className="text-muted-foreground">
                        ₹{((ci.menuItem?.price || ci.price || 0) * (ci.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between font-bold text-card-foreground">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Owner controls */}
                {order.status !== "delivered" && (
                  <Button
                    onClick={() => advanceStatus(order.id, order.status)}
                    className="w-full rounded-full"
                    disabled={updating === order.id}
                  >
                    {updating === order.id ? "Updating..." : `Mark as ${statusSteps[currentIdx + 1]?.label || "Next"}`}
                  </Button>
                )}
                {order.status === "delivered" && (
                  <p className="text-center text-sm font-semibold text-green-600">🎉 Delivered!</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OwnerOrdersPage;
