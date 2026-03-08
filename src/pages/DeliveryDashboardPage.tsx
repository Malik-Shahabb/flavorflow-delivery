import { useState, useEffect, useMemo } from "react";
import { Bike, Package, MapPin, Clock, CheckCircle2, Phone, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeliveryOrder {
  id: string;
  restaurant_name: string;
  status: string;
  total: number;
  created_at: string;
  items: any;
  delivery_agent_id: string | null;
}

const DeliveryDashboardPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchDeliveredOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["out-for-delivery", "preparing", "confirmed"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) setOrders(data as DeliveryOrder[]);
    setLoading(false);
  };

  const fetchDeliveredOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "delivered")
      .eq("delivery_agent_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setDeliveredOrders(data as DeliveryOrder[]);
  };

  const handlePickup = async (orderId: string) => {
    if (!user) return;
    if (orderId.startsWith("demo-")) {
      toast.success("Demo order picked up! In a real scenario, this would assign you.");
      return;
    }
    const { error } = await supabase
      .from("orders")
      .update({
        status: "out-for-delivery",
        delivery_agent_id: user.id,
        status_updated_at: new Date().toISOString(),
      } as any)
      .eq("id", orderId);

    if (error) {
      toast.error("Could not pick up order");
      return;
    }
    toast.success("Order picked up! Navigate to customer.");
    fetchOrders();
  };

  const handleDeliver = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered", status_updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      toast.error("Could not update order status");
      return;
    }
    toast.success("Order marked as delivered!");
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    fetchDeliveredOrders();
  };

  const demoOrders: DeliveryOrder[] = [
    {
      id: "demo-001",
      restaurant_name: "Spice Garden",
      status: "preparing",
      total: 340,
      created_at: new Date(Date.now() - 10 * 60000).toISOString(),
      items: [{ name: "Paneer Tikka", quantity: 2 }, { name: "Garlic Naan", quantity: 3 }],
      delivery_agent_id: null,
    },
    {
      id: "demo-002",
      restaurant_name: "Biryani House",
      status: "confirmed",
      total: 520,
      created_at: new Date(Date.now() - 5 * 60000).toISOString(),
      items: [{ name: "Chicken Biryani", quantity: 2 }, { name: "Raita", quantity: 2 }],
      delivery_agent_id: null,
    },
    {
      id: "demo-003",
      restaurant_name: "Dosa Corner",
      status: "preparing",
      total: 210,
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      items: [{ name: "Masala Dosa", quantity: 1 }, { name: "Filter Coffee", quantity: 2 }],
      delivery_agent_id: null,
    },
  ];

  const realAvailable = orders.filter((o) => (o.status === "preparing" || o.status === "confirmed") && !o.delivery_agent_id);
  const availableOrders = realAvailable.length > 0 ? realAvailable : demoOrders;

  const myActiveOrders = useMemo(() =>
    orders.filter((o) => o.status === "out-for-delivery" && o.delivery_agent_id === user?.id),
    [orders, user]
  );

  const stats = {
    delivered: deliveredOrders.length,
    active: myActiveOrders.length,
    earnings: deliveredOrders.reduce((sum, o) => sum + Number(o.total) * 0.1, 0).toFixed(0),
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="bg-card border-b border-border py-8">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl text-foreground flex items-center gap-3">
                <Bike className="h-8 w-8 text-primary" /> Delivery Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome, {user?.user_metadata?.full_name || "Agent"}
              </p>
            </div>
            <Button
              variant={isOnline ? "default" : "outline"}
              onClick={() => {
                setIsOnline(!isOnline);
                toast.success(isOnline ? "You're now offline" : "You're now online!");
              }}
              className="gap-2"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
              {isOnline ? "Online" : "Offline"}
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: "Completed", value: stats.delivered, icon: <Package className="h-5 w-5" /> },
              { label: "Active", value: stats.active, icon: <Bike className="h-5 w-5" /> },
              { label: "Earnings", value: `₹${stats.earnings}`, icon: <CheckCircle2 className="h-5 w-5" /> },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-background p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {s.icon}
                </div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mt-8 space-y-8">
        {/* My Active Deliveries */}
        <section>
          <h2 className="font-serif text-xl text-foreground mb-4">🚴 My Active Deliveries ({myActiveOrders.length})</h2>
          {myActiveOrders.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              No active deliveries — pick up an order below!
            </div>
          ) : (
            <div className="space-y-4">
              {myActiveOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{order.restaurant_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Customer Address</span>
                        <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Contact</span>
                      </div>
                      {Array.isArray(order.items) && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {(order.items as any[]).map((i: any) => `${i.name} x${i.quantity}`).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className="bg-primary/10 text-primary border-primary/20">Out for Delivery</Badge>
                      <p className="mt-1 font-bold text-foreground">₹{order.total}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1 gap-1" onClick={() => handleDeliver(order.id)}>
                      <CheckCircle2 className="h-4 w-4" /> Mark Delivered
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Phone className="h-4 w-4" /> Call
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Navigation className="h-4 w-4" /> Navigate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Orders to Pick Up */}
        {isOnline && (
          <section>
            <h2 className="font-serif text-xl text-foreground mb-4">📦 Available Orders ({availableOrders.length})</h2>
            {availableOrders.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                No orders available for pickup right now
              </div>
            ) : (
              <div className="space-y-3">
                {availableOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{order.restaurant_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> {order.status === "preparing" ? "Being prepared" : "Ready for pickup"} • ₹{order.total}
                      </p>
                      {Array.isArray(order.items) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {(order.items as any[]).length} item(s)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                      <Button size="sm" onClick={() => handlePickup(order.id)} className="gap-1">
                        <Bike className="h-4 w-4" /> Pick Up
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Delivery History */}
        <section>
          <h2 className="font-serif text-xl text-foreground mb-4">📋 My Delivery History ({deliveredOrders.length})</h2>
          {deliveredOrders.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              No deliveries completed yet
            </div>
          ) : (
            <div className="space-y-2">
              {deliveredOrders.map((d) => (
                <div key={d.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{d.restaurant_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(d.created_at).toLocaleDateString()} • {new Date(d.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">₹{d.total}</p>
                    <p className="text-xs text-primary">+₹{(Number(d.total) * 0.1).toFixed(0)} earned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;
