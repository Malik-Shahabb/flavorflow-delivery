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

    // Validation
    if (name.trim().length < 2 || name.trim().length > 100) {
      toast.error("Restaurant name must be 2-100 characters");
      return;
    }
    if (cuisine.trim().length < 2 || cuisine.trim().length > 50) {
      toast.error("Cuisine must be 2-50 characters");
      return;
    }
    if (address.trim().length < 5 || address.trim().length > 200) {
      toast.error("Address must be 5-200 characters");
      return;
    }

    const parsedFee = parseFloat(deliveryFee);
    const parsedMin = parseFloat(minOrder);
    if (isNaN(parsedFee) || parsedFee < 0 || parsedFee > 500) {
      toast.error("Delivery fee must be between ₹0 and ₹500");
      return;
    }
    if (isNaN(parsedMin) || parsedMin < 0 || parsedMin > 5000) {
      toast.error("Minimum order must be between ₹0 and ₹5000");
      return;
    }

    const validItems = menuItems.filter((m) => m.name.trim() && m.price);
    if (validItems.length === 0) {
      toast.error("Please add at least one menu item with a name and price.");
      return;
    }

    // Validate each menu item
    for (const item of validItems) {
      if (item.name.trim().length > 100) {
        toast.error(`Menu item "${item.name}" name is too long (max 100 chars)`);
        return;
      }
      const price = parseFloat(item.price);
      if (isNaN(price) || price <= 0 || price > 10000) {
        toast.error(`Menu item "${item.name}" must have a price between ₹1 and ₹10,000`);
        return;
      }
    }

    setLoading(true);
    try {
      const { data: restaurant, error: rError } = await supabase
        .from("restaurants")
        .insert({
          owner_id: user.id,
          name: name.trim(),
          cuisine: cuisine.trim(),
          address: address.trim(),
          delivery_time: deliveryTime,
          delivery_fee: parsedFee,
          min_order: parsedMin,
          image: image.trim() || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5) : [],
        })
        .select()
        .single();

      if (rError) throw rError;

      const itemsToInsert = validItems.map((m) => ({
        restaurant_id: restaurant.id,
        name: m.name.trim(),
        description: m.description.trim().slice(0, 500),
        price: parseFloat(m.price),
        category: m.category || "Mains",
        image: m.image.trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
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

      <div className="container mt-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Restaurant Details */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-xl text-card-foreground">Restaurant Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Restaurant Name *</Label>
                <Input required placeholder="My Restaurant" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" maxLength={100} />
              </div>
              <div>
                <Label>Cuisine *</Label>
                <Input required placeholder="Italian, Indian..." value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="mt-1" maxLength={50} />
              </div>
              <div className="sm:col-span-2">
                <Label>Address *</Label>
                <Input required placeholder="123 Main Street" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" maxLength={200} />
              </div>
              <div>
                <Label>Delivery Time</Label>
                <Input placeholder="30-45 min" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="mt-1" maxLength={30} />
              </div>
              <div>
                <Label>Delivery Fee (₹)</Label>
                <Input type="number" step="0.01" min="0" max="500" placeholder="2.99" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Minimum Order (₹)</Label>
                <Input type="number" step="0.01" min="0" max="5000" placeholder="10" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input placeholder="Popular, Fast" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1" maxLength={100} />
              </div>
              <div className="sm:col-span-2">
                <Label>Image URL (optional)</Label>
                <Input placeholder="https://..." value={image} onChange={(e) => setImage(e.target.value)} className="mt-1" maxLength={500} />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-card-foreground">Menu Items</h2>
              <Button type="button" variant="outline" size="sm" onClick={addMenuItem} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </div>
            {menuItems.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Item {idx + 1}</span>
                  {menuItems.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeMenuItem(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Name *</Label>
                    <Input required placeholder="Item name" value={item.name} onChange={(e) => updateMenuItem(idx, "name", e.target.value)} className="mt-1" maxLength={100} />
                  </div>
                  <div>
                    <Label>Price (₹) *</Label>
                    <Input required type="number" step="0.01" min="1" max="10000" placeholder="9.99" value={item.price} onChange={(e) => updateMenuItem(idx, "price", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input placeholder="Mains" value={item.category} onChange={(e) => updateMenuItem(idx, "category", e.target.value)} className="mt-1" maxLength={50} />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input placeholder="https://..." value={item.image} onChange={(e) => updateMenuItem(idx, "image", e.target.value)} className="mt-1" maxLength={500} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Description</Label>
                    <Input placeholder="Short description" value={item.description} onChange={(e) => updateMenuItem(idx, "description", e.target.value)} className="mt-1" maxLength={500} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={item.is_veg} onCheckedChange={(v) => updateMenuItem(idx, "is_veg", v)} />
                      <Label>Veg</Label>
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

          <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
            {loading ? "Registering..." : "Register Restaurant"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterRestaurantPage;
