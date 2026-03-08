import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, ShoppingBag, Store, ArrowLeft, BarChart3 } from "lucide-react";
import { useMemo } from "react";

const OwnerDashboardPage = () => {
  const { user, isReady } = useAuth();
  const { data: allRestaurants, isLoading } = useRestaurants();

  const myRestaurants = useMemo(() => {
    if (!user || !allRestaurants) return [];
    return allRestaurants.filter((r) => r.owner_id === user.id);
  }, [user, allRestaurants]);

  if (!isReady || isLoading) {
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

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-card border-b border-border py-8">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl text-foreground">Owner Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Manage your restaurants, menu items, and orders</p>
            </div>
            <Link to="/register-restaurant">
              <Button className="gap-1.5 rounded-full">
                <Plus className="h-4 w-4" /> Add Restaurant
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mt-8 max-w-4xl space-y-6">
        {myRestaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
            <Store className="h-16 w-16 text-muted-foreground/40" />
            <h2 className="mt-4 font-serif text-2xl text-foreground">No restaurants yet</h2>
            <p className="mt-2 text-muted-foreground">Register your first restaurant to start receiving orders.</p>
            <Link to="/register-restaurant">
              <Button className="mt-6 gap-1.5 rounded-full">
                <Plus className="h-4 w-4" /> Register Restaurant
              </Button>
            </Link>
          </div>
        ) : (
          myRestaurants.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <img src={r.image} alt={r.name} className="h-40 w-full sm:w-48 object-cover" />
                <div className="flex-1 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-card-foreground">{r.name}</h3>
                      <p className="text-sm text-muted-foreground">{r.cuisine} · {r.address}</p>
                    </div>
                    <Badge variant={r.is_open ? "default" : "secondary"}>
                      {r.is_open ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.menu.length} menu items · ₹{r.delivery_fee.toFixed(2)} delivery fee</p>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/manage-restaurant/${r.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Settings className="h-4 w-4" /> Manage Menu
                      </Button>
                    </Link>
                    <Link to={`/owner-orders/${r.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <ShoppingBag className="h-4 w-4" /> View Orders
                      </Button>
                    </Link>
                    <Link to={`/analytics/${r.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <BarChart3 className="h-4 w-4" /> Analytics
                      </Button>
                    </Link>
                    <Link to={`/restaurant/${r.id}`}>
                      <Button variant="ghost" size="sm">View Page →</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
