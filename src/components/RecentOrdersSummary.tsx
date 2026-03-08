import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Package, ChefHat, Truck, CheckCircle2, ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig = {
  confirmed: { label: "Confirmed", icon: Package, color: "text-primary" },
  preparing: { label: "Preparing", icon: ChefHat, color: "text-amber-500" },
  "out-for-delivery": { label: "Out for Delivery", icon: Truck, color: "text-blue-500" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-success" },
} as const;

const stepOrder = ["confirmed", "preparing", "out-for-delivery", "delivered"];

interface RecentOrder {
  id: string;
  status: string;
  restaurantName: string;
  total: number;
  createdAt: Date;
  isLocal?: boolean;
}

const RecentOrdersSummary = () => {
  const { user } = useAuth();
  const { orders: localOrders } = useCart();
  const [dbOrders, setDbOrders] = useState<RecentOrder[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Fetch recent DB orders
  useEffect(() => {
    if (!user) return;

    const fetchRecent = async () => {
      const twentyMinAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("orders")
        .select("id, status, restaurant_name, total, created_at")
        .eq("user_id", user.id)
        .gte("created_at", twentyMinAgo)
        .order("created_at", { ascending: false })
        .limit(3);

      if (data) {
        setDbOrders(
          data.map((o) => ({
            id: o.id,
            status: o.status,
            restaurantName: o.restaurant_name,
            total: o.total,
            createdAt: new Date(o.created_at),
          }))
        );
      }
    };

    fetchRecent();

    // Realtime updates
    const channel = supabase
      .channel("recent-orders-widget")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        () => fetchRecent()
      )
      .subscribe();

    // Re-fetch every 30s to handle time window
    const interval = setInterval(fetchRecent, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  // Merge local orders (within 20 min, not in DB)
  const twentyMinAgo = Date.now() - 20 * 60 * 1000;
  const recentLocalOrders: RecentOrder[] = localOrders
    .filter((o) => !o.dbOrderId && o.createdAt.getTime() > twentyMinAgo)
    .slice(0, 3)
    .map((o) => ({
      id: o.id,
      status: o.status,
      restaurantName: o.restaurantName,
      total: o.total,
      createdAt: o.createdAt,
      isLocal: true,
    }));

  // Combine, sort, take last 3
  const allRecent = [...dbOrders, ...recentLocalOrders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  if (allRecent.length === 0 || dismissed) return null;

  const progressPercent = (status: string) => {
    const idx = stepOrder.indexOf(status);
    return ((idx + 1) / stepOrder.length) * 100;
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <Link to="/orders" className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors">
          <Package className="h-4 w-4 text-primary" />
          Recent Orders ({allRecent.length})
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(!expanded)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button onClick={() => setDismissed(true)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Orders list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border">
              {allRecent.map((order) => {
                const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.confirmed;
                const Icon = config.icon;
                const progress = progressPercent(order.status);

                return (
                  <Link
                    key={order.id}
                    to="/orders"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground truncate">{order.restaurantName}</p>
                        <span className="text-xs font-semibold text-foreground ml-2">₹{order.total.toFixed(0)}</span>
                      </div>
                      <p className={`text-[11px] font-medium ${config.color}`}>{config.label}</p>
                      {/* Mini progress bar */}
                      <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecentOrdersSummary;
