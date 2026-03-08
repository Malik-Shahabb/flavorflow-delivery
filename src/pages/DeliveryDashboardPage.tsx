import { useState, useEffect, useMemo } from "react";
import { Bike, Package, MapPin, Clock, CheckCircle2, Phone } from "lucide-react";
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
}

const statusFlow = ["confirmed", "preparing", "out-for-delivery", "delivered"];

const DeliveryDashboardPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    // Fetch orders that are out-for-delivery (simulating assigned deliveries)
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["out-for-delivery", "preparing"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) setOrders(data as DeliveryOrder[]);
    setLoading(false);
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
  };

  const activeOrders = useMemo(() => orders.filter((o) => o.status === "out-for-delivery"), [orders]);
  const pendingPickup = useMemo(() => orders.filter((o) => o.status === "preparing"), [orders]);

  const stats = {
    delivered: 24, // simulated
    active: activeOrders.length,
    earnings: 1250, // simulated
  };

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
              <p className="text-muted-foreground mt-1">Manage your deliveries</p>
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
              { label: "Today's Deliveries", value: stats.delivered, icon: <Package className="h-5 w-5" /> },
              { label: "Active Orders", value: stats.active, icon: <Bike className="h-5 w-5" /> },
              { label: "Today's Earnings", value: `₹${stats.earnings}`, icon: <CheckCircle2 className="h-5 w-5" /> },
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
        {/* Active Deliveries */}
        <section>
          <h2 className="font-serif text-xl text-foreground mb-4">🚴 Active Deliveries ({activeOrders.length})</h2>
          {activeOrders.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              No active deliveries right now
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
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
                      <Phone className="h-4 w-4" /> Call Customer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Pickup */}
        <section>
          <h2 className="font-serif text-xl text-foreground mb-4">📦 Pending Pickup ({pendingPickup.length})</h2>
          {pendingPickup.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              No orders pending pickup
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPickup.map((order) => (
                <div key={order.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{order.restaurant_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" /> Being prepared • ₹{order.total}
                    </p>
                  </div>
                  <Badge variant="secondary">Preparing</Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Delivery History (simulated) */}
        <section>
          <h2 className="font-serif text-xl text-foreground mb-4">📋 Recent Deliveries</h2>
          <div className="space-y-2">
            {[
              { name: "The Golden Wok", time: "12:30 PM", amount: 520, tip: 40 },
              { name: "Bella Italia", time: "11:15 AM", amount: 780, tip: 50 },
              { name: "Food plaza", time: "10:00 AM", amount: 350, tip: 30 },
            ].map((d, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₹{d.amount}</p>
                  <p className="text-xs text-green-500">+₹{d.tip} tip</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;
