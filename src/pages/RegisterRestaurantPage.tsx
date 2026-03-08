import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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

const RegisterRestaurantPage = () => {
  const { user, isReady } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("30-45 min");
  const [deliveryFee, setDeliveryFee] = useState("2.99");
  const [minOrder, setMinOrder] = useState("10");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState("");

  const [menuItems, setMenuItems] = useState<NewMenuItem[]>([{ ...emptyItem }]);

  if (!isReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Please sign in to register a restaurant.</p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  const addMenuItem = () => setMenuItems((prev) => [...prev, { ...emptyItem }]);

  const removeMenuItem = (idx: number) =>
    setMenuItems((prev) => prev.filter((_, i) => i !== idx));

  const updateMenuItem = (idx: number, field: keyof NewMenuItem, value: any) =>
    setMenuItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = menuItems.filter((m) => m.name && m.price);
    if (validItems.length === 0) {
      toast.error("Please add at least one menu item with a name and price.");
      return;
    }

    setLoading(true);
    try {
      const { data: restaurant, error: rError } = await supabase
        .from("restaurants")
        .insert({
          owner_id: user.id,
          name,
          cuisine,
          address,
          delivery_time: deliveryTime,
          delivery_fee: parseFloat(deliveryFee) || 2.99,
          min_order: parseFloat(minOrder) || 10,
          image: image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        })
        .select()
        .single();

      if (rError) throw rError;

      const itemsToInsert = validItems.map((m) => ({
        restaurant_id: restaurant.id,
        name: m.name,
        description: m.description,
        price: parseFloat(m.price),
        category: m.category,
        image: m.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
        is_veg: m.is_veg,
        is_popular: m.is_popular,
      }));

      const { error: mError } = await supabase.from("menu_items").insert(itemsToInsert);
      if (mError) throw mError;

      toast.success("Restaurant registered! It will be visible after admin approval.", { duration: 6000 });
      navigate(`/restaurant/${restaurant.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to register restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-card border-b border-border py-8">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="font-serif text-3xl text-foreground">Register Your Restaurant</h1>
          <p className="mt-1 text-muted-foreground">Fill in the details and add your menu items</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container mt-8 max-w-3xl space-y-8">
        {/* Restaurant Details */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-serif text-xl text-card-foreground">Restaurant Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Restaurant Name *</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Golden Wok" className="mt-1" />
            </div>
            <div>
              <Label>Cuisine *</Label>
              <Input required value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Chinese · Asian Fusion" className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Address *</Label>
              <Input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street" className="mt-1" />
            </div>
            <div>
              <Label>Delivery Time</Label>
              <Input value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="30-45 min" className="mt-1" />
            </div>
            <div>
              <Label>Delivery Fee ($)</Label>
              <Input type="number" step="0.01" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Minimum Order ($)</Label>
              <Input type="number" step="0.01" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
            <div className="sm:col-span-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Popular, Free delivery over $30" className="mt-1" />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-card-foreground">Menu Items</h2>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addMenuItem}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>

          {menuItems.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Item {idx + 1}</span>
                {menuItems.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeMenuItem(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Name *</Label>
                  <Input value={item.name} onChange={(e) => updateMenuItem(idx, "name", e.target.value)} placeholder="Kung Pao Chicken" className="mt-1" />
                </div>
                <div>
                  <Label>Price ($) *</Label>
                  <Input type="number" step="0.01" value={item.price} onChange={(e) => updateMenuItem(idx, "price", e.target.value)} placeholder="14.99" className="mt-1" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={item.category} onChange={(e) => updateMenuItem(idx, "category", e.target.value)} placeholder="Mains" className="mt-1" />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input value={item.image} onChange={(e) => updateMenuItem(idx, "image", e.target.value)} placeholder="https://..." className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Input value={item.description} onChange={(e) => updateMenuItem(idx, "description", e.target.value)} placeholder="Spicy stir-fried chicken..." className="mt-1" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={item.is_veg} onCheckedChange={(v) => updateMenuItem(idx, "is_veg", v)} />
                    <Label>Vegetarian</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={item.is_popular} onCheckedChange={(v) => updateMenuItem(idx, "is_popular", v)} />
                    <Label>Popular</Label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
          {loading ? "Registering..." : "Register Restaurant"}
        </Button>
      </form>
    </div>
  );
};

export default RegisterRestaurantPage;
