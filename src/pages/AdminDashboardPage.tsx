import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
}

interface UserRow {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
}

interface RestaurantRow {
  id: string;
  name: string;
  cuisine: string;
  is_open: boolean;
  is_approved: boolean;
  owner_id: string;
  created_at: string;
}

interface OrderRow {
  id: string;
  total: number;
  status: string;
  restaurant_name: string;
  created_at: string;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(142 70% 45%)",
  "hsl(38 92% 50%)",
  "hsl(280 65% 60%)",
  "hsl(0 72% 50%)",
];

const AdminDashboardPage = () => {
  const { user, isReady } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalRestaurants: 0, totalOrders: 0, totalRevenue: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [allOrders, setAllOrders] = useState<OrderRow[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "users" | "restaurants" | "pending">("overview");

  useEffect(() => {
    if (!isReady || !user) {
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data);
      if (data) await loadData();
      setLoading(false);
    };

    checkAdmin();
  }, [user, isReady]);

  const loadData = async () => {
    const [profilesRes, restaurantsRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, created_at"),
      supabase.from("restaurants").select("id, name, cuisine, is_open, is_approved, owner_id, created_at"),
      supabase.from("orders").select("id, total, status, restaurant_name, created_at"),
    ]);

    const usersData = (profilesRes.data || []) as UserRow[];
    const restaurantsData = (restaurantsRes.data || []) as RestaurantRow[];
    const ordersData = (ordersRes.data || []) as OrderRow[];

    setUsers(usersData);
    setRestaurants(restaurantsData);
    setAllOrders(ordersData);

    setStats({
      totalUsers: usersData.length,
      totalRestaurants: restaurantsData.length,
      totalOrders: ordersData.length,
      totalRevenue: ordersData.reduce((s, o) => s + (o.total || 0), 0),
    });
  };

  const handleApproval = async (restaurantId: string, approve: boolean) => {
    const { error } = await supabase
      .from("restaurants")
      .update({ is_approved: approve })
      .eq("id", restaurantId);

    if (error) {
      toast.error("Failed to update restaurant status");
      return;
    }

    toast.success(approve ? "Restaurant approved!" : "Restaurant rejected.");
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, is_approved: approve } : r))
    );
  };

  // --- Chart data generators ---
  const getRevenueByDay = () => {
    const dayMap: Record<string, number> = {};
    allOrders.forEach((o) => {
      const day = new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      dayMap[day] = (dayMap[day] || 0) + (o.total || 0);
    });
    // If no real data, show demo
    if (Object.keys(dayMap).length === 0) {
      return [
        { day: "01 Mar", revenue: 2400 },
        { day: "02 Mar", revenue: 3800 },
        { day: "03 Mar", revenue: 1900 },
        { day: "04 Mar", revenue: 4200 },
        { day: "05 Mar", revenue: 5600 },
        { day: "06 Mar", revenue: 3100 },
        { day: "07 Mar", revenue: 4800 },
        { day: "08 Mar", revenue: 6200 },
      ];
    }
    return Object.entries(dayMap)
      .slice(-10)
      .map(([day, revenue]) => ({ day, revenue }));
  };

  const getOrdersByStatus = () => {
    const statusMap: Record<string, number> = {};
    allOrders.forEach((o) => {
      const s = o.status || "unknown";
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    if (Object.keys(statusMap).length === 0) {
      return [
        { name: "Delivered", value: 45 },
        { name: "Preparing", value: 12 },
        { name: "Confirmed", value: 8 },
        { name: "Cancelled", value: 3 },
      ];
    }
    return Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
      value,
    }));
  };

  const getTopRestaurants = () => {
    const restMap: Record<string, number> = {};
    allOrders.forEach((o) => {
      restMap[o.restaurant_name] = (restMap[o.restaurant_name] || 0) + (o.total || 0);
    });
    if (Object.keys(restMap).length === 0) {
      return [
        { name: "Spice Garden", revenue: 12400 },
        { name: "Biryani House", revenue: 9800 },
        { name: "Dosa Corner", revenue: 7600 },
        { name: "Pizza Palace", revenue: 6200 },
        { name: "Curry Kingdom", revenue: 5100 },
      ];
    }
    return Object.entries(restMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));
  };

  const getUserGrowth = () => {
    const dayMap: Record<string, number> = {};
    users.forEach((u) => {
      const day = new Date(u.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    if (Object.keys(dayMap).length <= 1) {
      return [
        { day: "01 Mar", users: 2 },
        { day: "02 Mar", users: 5 },
        { day: "03 Mar", users: 3 },
        { day: "04 Mar", users: 7 },
        { day: "05 Mar", users: 4 },
        { day: "06 Mar", users: 8 },
        { day: "07 Mar", users: 6 },
        { day: "08 Mar", users: 10 },
      ];
    }
    let cumulative = 0;
    return Object.entries(dayMap)
      .slice(-10)
      .map(([day, count]) => {
        cumulative += count;
        return { day, users: cumulative };
      });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Please sign in first.</p>
        <Link to="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Shield className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="font-serif text-2xl text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        <Link to="/"><Button variant="outline">Go Home</Button></Link>
      </div>
    );
  }

  const pendingRestaurants = restaurants.filter((r) => !r.is_approved);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Restaurants", value: stats.totalRestaurants, icon: Store, color: "text-primary" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-primary" },
    { label: "Revenue", value: `₹${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: "text-primary" },
  ];

  const tabs = ["overview", "analytics", "users", "restaurants", "pending"] as const;

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-card border-b border-border py-8">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="font-serif text-3xl text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Platform overview and management</p>
        </div>
      </div>

      <div className="container mt-8 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "pending" ? "Pending Approval" : tab}
              {tab === "pending" && pendingRestaurants.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {pendingRestaurants.length}
                </span>
              )}
              {tab === "analytics" && (
                <BarChart3 className="ml-1 inline h-3.5 w-3.5" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-serif text-lg text-card-foreground mb-4">Platform Summary</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• {stats.totalUsers} registered users</p>
                <p>• {stats.totalRestaurants} restaurants on the platform</p>
                <p>• {pendingRestaurants.length} restaurants pending approval</p>
                <p>• {stats.totalOrders} orders processed</p>
                <p>• ₹{stats.totalRevenue.toFixed(2)} total revenue generated</p>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Revenue Trend */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-serif text-lg text-card-foreground mb-1 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Revenue Trend
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Daily revenue over recent period</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getRevenueByDay()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [`₹${value}`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Order Status Distribution */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-serif text-lg text-card-foreground mb-1 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" /> Order Status
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Distribution by current status</p>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getOrdersByStatus()}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {getOrdersByStatus().map((_, idx) => (
                            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Restaurants */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-serif text-lg text-card-foreground mb-1 flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" /> Top Restaurants
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">By revenue</p>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTopRestaurants()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₹${v}`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={100} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                          formatter={(value: number) => [`₹${value}`, "Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* User Growth */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-serif text-lg text-card-foreground mb-1 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> User Growth
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Cumulative registered users over time</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getUserGrowth()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                      />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <table className="w-full min-w-[400px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 text-card-foreground">{u.full_name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{u.phone || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "restaurants" && (
            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <table className="w-full min-w-[450px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Cuisine</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Approval</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {restaurants.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-card-foreground">{r.name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{r.cuisine}</td>
                      <td className="px-4 py-3">
                        <Badge variant={r.is_open ? "default" : "secondary"}>{r.is_open ? "Open" : "Closed"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={r.is_approved ? "default" : "destructive"} className="gap-1">
                          {r.is_approved ? <><CheckCircle className="h-3 w-3" /> Approved</> : <><Clock className="h-3 w-3" /> Pending</>}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "pending" && (
            <div className="space-y-4">
              {pendingRestaurants.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-muted-foreground">No restaurants pending approval.</p>
                </div>
              ) : (
                pendingRestaurants.map((r) => (
                  <div key={r.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-medium text-card-foreground">{r.name}</h4>
                      <p className="text-sm text-muted-foreground">{r.cuisine} • Registered {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1.5" onClick={() => handleApproval(r.id, true)}>
                        <CheckCircle className="h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => handleApproval(r.id, false)}>
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
