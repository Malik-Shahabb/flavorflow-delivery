import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Flame,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

interface Order {
  id: string;
  total: number;
  items: any;
  created_at: string;
  status: string;
}

const COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(15, 80%, 50%)",
  "hsl(142, 72%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(200, 70%, 50%)",
  "hsl(280, 60%, 50%)",
];

const RestaurantAnalyticsPage = () => {
  const { id } = useParams();
  const { user, isReady } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !user || !id) return;

    const fetch = async () => {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("name, owner_id")
        .eq("id", id)
        .maybeSingle();

      if (!restaurant || restaurant.owner_id !== user.id) {
        setLoading(false);
        return;
      }

      setRestaurantName(restaurant.name);

      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total, items, created_at, status")
        .eq("restaurant_id", id)
        .order("created_at", { ascending: true });

      setOrders((ordersData || []) as Order[]);
      setLoading(false);
    };

    fetch();
  }, [id, user, isReady]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Popular items
  const popularItems = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      items.forEach((item: any) => {
        const name = item.menuItem?.name || "Unknown";
        counts[name] = (counts[name] || 0) + (item.quantity || 1);
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [orders]);

  // Revenue over time (by day)
  const revenueByDay = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const day = new Date(o.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      map[day] = (map[day] || 0) + o.total;
    });
    return Object.entries(map).map(([day, revenue]) => ({ day, revenue }));
  }, [orders]);

  // Orders by status
  const ordersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [orders]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Revenue", value: `₹${totalRevenue.toFixed(0)}`, icon: IndianRupee, color: "text-success" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-primary" },
    { label: "Avg Order Value", value: `₹${avgOrderValue.toFixed(0)}`, icon: TrendingUp, color: "text-warning" },
    { label: "Top Item", value: popularItems[0]?.name || "—", icon: Flame, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-card border-b border-border py-8">
        <div className="container">
          <Link to="/owner-dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="font-serif text-3xl text-foreground">Analytics — {restaurantName}</h1>
          <p className="mt-1 text-muted-foreground">Revenue, popular items, and order trends</p>
        </div>
      </div>

      <div className="container mt-8 max-w-5xl space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-xl font-bold text-card-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No orders yet. Analytics will appear once you receive orders.</p>
          </div>
        ) : (
          <>
            {/* Revenue Chart */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-serif text-lg text-card-foreground mb-4">Revenue Over Time</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(var(--card-foreground))" }}
                    formatter={(value: number) => [`₹${value.toFixed(0)}`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(25, 95%, 53%)" strokeWidth={2} dot={{ fill: "hsl(25, 95%, 53%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Popular Items */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-serif text-lg text-card-foreground mb-4">Popular Items</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={popularItems} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={100} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      formatter={(value: number) => [value, "Orders"]}
                    />
                    <Bar dataKey="count" fill="hsl(25, 95%, 53%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Orders by Status */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-serif text-lg text-card-foreground mb-4">Orders by Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, count }) => `${status} (${count})`}>
                      {ordersByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantAnalyticsPage;
