import { Plus, Minus } from "lucide-react";
import { MenuItem } from "@/data/restaurants";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MenuItemCardProps {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
}

const MenuItemCard = ({ item, restaurantId, restaurantName }: MenuItemCardProps) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((ci) => ci.menuItem.id === item.id);

  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-card">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-3 w-3 rounded-sm border ${item.isVeg ? "border-success bg-success/20" : "border-destructive bg-destructive/20"}`} />
          {item.isPopular && (
            <Badge variant="secondary" className="text-xs">
              ⭐ Popular
            </Badge>
          )}
        </div>
        <h4 className="mt-1.5 font-serif text-base text-card-foreground">{item.name}</h4>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        <p className="mt-2 font-semibold text-card-foreground">${item.price.toFixed(2)}</p>
      </div>
      <div className="relative flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="h-24 w-24 rounded-lg object-cover"
          loading="lazy"
        />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          {cartItem ? (
            <div className="flex items-center gap-1 rounded-full bg-primary px-1 shadow-md">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-primary-foreground hover:bg-primary/80"
                onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-[20px] text-center text-sm font-bold text-primary-foreground">
                {cartItem.quantity}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-primary-foreground hover:bg-primary/80"
                onClick={() => addItem(item, restaurantId, restaurantName)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="h-7 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90"
              onClick={() => addItem(item, restaurantId, restaurantName)}
            >
              ADD
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
