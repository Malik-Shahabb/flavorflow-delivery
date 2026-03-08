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
} from "lucide-react";
import { toast } from "sonner";

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

const AdminDashboardPage = () => {
  const { user, isReady } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalRestaurants: 0, totalOrders: 0, totalRevenue: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "restaurants" | "pending">("overview");

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
      supabase.from("orders").select("id, total"),
    ]);

    setUsers((profilesRes.data || []) as UserRow[]);
    setRestaurants((restaurantsRes.data || []) as RestaurantRow[]);

    const orders = ordersRes.data || [];
    setStats({
      totalUsers: (profilesRes.data || []).length,
      totalRestaurants: (restaurantsRes.data || []).length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s: number, o: any) => s + (o.total || 0), 0),
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
    { label: "Restaurants", value: stats.totalRestaurants, icon: Store, color: "text-accent" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-success" },
    { label: "Revenue", value: `₹${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: "text-warning" },
  ];

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
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 border-b border-border">
          {(["overview", "users", "restaurants", "pending"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
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