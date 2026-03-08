import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { DbMenuItem } from "@/hooks/useRestaurants";

interface EditMenuItemDialogProps {
  item: DbMenuItem;
  restaurantId: string;
}

const EditMenuItemDialog = ({ item, restaurantId }: EditMenuItemDialogProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: item.name,
    description: item.description,
    price: item.price.toString(),
    category: item.category,
    image: item.image,
    is_veg: item.is_veg,
    is_popular: item.is_popular,
  });

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          category: form.category,
          image: form.image,
          is_veg: form.is_veg,
          is_popular: form.is_popular,
        })
        .eq("id", item.id);
      if (error) throw error;
      toast.success("Item updated!");
      queryClient.invalidateQueries({ queryKey: ["restaurant", restaurantId] });
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Edit Menu Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Price (₹)</Label>
            <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Image URL</Label>
            <Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} className="mt-1" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_veg} onCheckedChange={(v) => setForm((f) => ({ ...f, is_veg: v }))} />
              <Label>Vegetarian</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_popular} onCheckedChange={(v) => setForm((f) => ({ ...f, is_popular: v }))} />
              <Label>Popular</Label>
            </div>
          </div>
          <Button className="w-full rounded-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditMenuItemDialog;
