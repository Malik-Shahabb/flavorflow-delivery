import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useRestaurant } from "@/hooks/useRestaurants";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import EditMenuItemDialog from "@/components/EditMenuItemDialog";

interface NewMenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  is_veg: boolean;
  is_popular: boolean;
}

const emptyItem: NewMenuItem = {
  name: "",
  description: "",
  price: "",
  category: "Mains",
  image: "",
  is_veg: false,
  is_popular: false,
};

const ManageRestaurantPage = () => {
  const { id } = useParams();
  const { user, isReady } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: restaurant, isLoading } = useRestaurant(id);

  const [deleting, setDeleting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingRestaurant, setDeletingRestaurant] = useState(false);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [newItems, setNewItems] = useState<NewMenuItem[]>([{ ...emptyItem }]);

  const handleToggleOpen = async () => {
    if (!restaurant) return;
    setTogglingOpen(true);
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ is_open: !restaurant.is_open })
        .eq("id", restaurant.id);
      if (error) throw error;
      toast.success(restaurant.is_open ? "Restaurant marked as Closed" : "Restaurant marked as Open");
      queryClient.invalidateQueries({ queryKey: ["restaurant", id] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setTogglingOpen(false);
    }
  };

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

  if (!restaurant || restaurant.owner_id !== user.id) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Restaurant not found or you don't have access.</p>
        <Link to="/restaurants"><Button variant="outline">Back to Restaurants</Button></Link>
      </div>
    );
  }

  const handleDeleteItem = async (itemId: string) => {
    setDeleting(itemId);
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", itemId);
      if (error) throw error;
      toast.success("Item removed");
      queryClient.invalidateQueries({ queryKey: ["restaurant", id] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    } finally {
      setDeleting(null);
    }
  };

  const addNewItem = () => setNewItems((prev) => [...prev, { ...emptyItem }]);
  const removeNewItem = (idx: number) => setNewItems((prev) => prev.filter((_, i) => i !== idx));
  const updateNewItem = (idx: number, field: keyof NewMenuItem, value: any) =>
    setNewItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const handleAddItems = async () => {
    const valid = newItems.filter((m) => m.name && m.price);
    if (valid.length === 0) {
      toast.error("Add at least one item with name and price.");
      return;
    }
    setAdding(true);
    try {
      const rows = valid.map((m) => ({
        restaurant_id: restaurant.id,
        name: m.name,
        description: m.description,
        price: parseFloat(m.price),
        category: m.category,
        image: m.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
        is_veg: m.is_veg,
        is_popular: m.is_popular,
      }));
      const { error } = await supabase.from("menu_items").insert(rows);
      if (error) throw error;
      toast.success(`${valid.length} item(s) added!`);
      setNewItems([{ ...emptyItem }]);
      queryClient.invalidateQueries({ queryKey: ["restaurant", id] });
    } catch (err: any) {
      toast.error(err.message || "Failed to add items");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-card border-b border-border py-8">
        <div className="container">
          <Link to={`/restaurant/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Restaurant
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-3xl text-foreground">Manage: {restaurant.name}</h1>
              <p className="mt-1 text-muted-foreground">Add, edit, or remove menu items</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={togglingOpen}
                onClick={handleToggleOpen}
              >
                {restaurant.is_open ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
                {togglingOpen ? "Updating..." : restaurant.is_open ? "Open" : "Closed"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                disabled={deletingRestaurant}
                onClick={async () => {
                  if (!confirm("Are you sure you want to delete this restaurant and all its menu items? This cannot be undone.")) return;
                  setDeletingRestaurant(true);
                  try {
                    const { error: mErr } = await supabase.from("menu_items").delete().eq("restaurant_id", restaurant.id);
                    if (mErr) throw mErr;
                    const { error: rErr } = await supabase.from("restaurants").delete().eq("id", restaurant.id);
                    if (rErr) throw rErr;
                    toast.success("Restaurant deleted");
                    queryClient.invalidateQueries({ queryKey: ["restaurants"] });
                    navigate("/owner-dashboard");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to delete restaurant");
                    setDeletingRestaurant(false);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" /> {deletingRestaurant ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-8 max-w-3xl space-y-8">
        {/* Existing Items */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-serif text-xl text-card-foreground">Current Menu ({restaurant.menu.length} items)</h2>
          {restaurant.menu.length === 0 ? (
            <p className="text-muted-foreground text-sm">No items yet.</p>
          ) : (
            restaurant.menu.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
                  <div>
                    <p className="font-medium text-card-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category} · ₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={deleting === item.id}
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add New Items */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-card-foreground">Add New Items</h2>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addNewItem}>
              <Plus className="h-4 w-4" /> Add Another
            </Button>
          </div>

          {newItems.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">New Item {idx + 1}</span>
                {newItems.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeNewItem(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Name *</Label>
                  <Input value={item.name} onChange={(e) => updateNewItem(idx, "name", e.target.value)} placeholder="Kung Pao Chicken" className="mt-1" />
                </div>
                <div>
                  <Label>Price ($) *</Label>
                  <Input type="number" step="0.01" value={item.price} onChange={(e) => updateNewItem(idx, "price", e.target.value)} placeholder="14.99" className="mt-1" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={item.category} onChange={(e) => updateNewItem(idx, "category", e.target.value)} placeholder="Mains" className="mt-1" />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={item.image} onChange={(e) => updateNewItem(idx, "image", e.target.value)} placeholder="https://..." className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Input value={item.description} onChange={(e) => updateNewItem(idx, "description", e.target.value)} placeholder="Spicy stir-fried chicken..." className="mt-1" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={item.is_veg} onCheckedChange={(v) => updateNewItem(idx, "is_veg", v)} />
                    <Label>Vegetarian</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={item.is_popular} onCheckedChange={(v) => updateNewItem(idx, "is_popular", v)} />
                    <Label>Popular</Label>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button className="w-full rounded-full" disabled={adding} onClick={handleAddItems}>
            {adding ? "Adding..." : "Save New Items"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageRestaurantPage;
