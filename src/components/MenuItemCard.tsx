import { Plus, Minus, Star } from "lucide-react";
import { MenuItem } from "@/data/restaurants";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MOCK_ITEM_REVIEWS: Record<string, { rating: number; count: number; reviews: { name: string; rating: number; comment: string; date: string }[] }> = {
  "Kung Pao Chicken": { rating: 4.6, count: 28, reviews: [
    { name: "Rahul S.", rating: 5, comment: "Perfectly spiced! The peanuts add a great crunch.", date: "2026-03-01" },
    { name: "Anita D.", rating: 4, comment: "Really good, could be a bit spicier for my taste.", date: "2026-02-25" },
    { name: "Vikram P.", rating: 5, comment: "My go-to dish every time I order from here!", date: "2026-02-20" },
  ]},
  "Vegetable Spring Rolls": { rating: 4.3, count: 15, reviews: [
    { name: "Priya M.", rating: 4, comment: "Crispy and fresh! Great as a starter.", date: "2026-03-04" },
    { name: "Karthik N.", rating: 5, comment: "Best spring rolls in town, hands down.", date: "2026-02-28" },
  ]},
  "Dan Dan Noodles": { rating: 4.8, count: 34, reviews: [
    { name: "Sneha R.", rating: 5, comment: "Incredible flavor! The sesame sauce is addictive.", date: "2026-03-05" },
    { name: "Arjun G.", rating: 5, comment: "Authentic taste, perfect portion size.", date: "2026-03-01" },
    { name: "Meena I.", rating: 4, comment: "Loved it! A tiny bit oily but delicious.", date: "2026-02-22" },
  ]},
  "Szechuan Tofu": { rating: 4.4, count: 19, reviews: [
    { name: "Deepa M.", rating: 5, comment: "Amazing tofu dish! So flavorful and spicy.", date: "2026-03-03" },
    { name: "Rohan K.", rating: 4, comment: "Great vegetarian option with bold flavors.", date: "2026-02-27" },
  ]},
  "Butter Chicken": { rating: 4.9, count: 52, reviews: [
    { name: "Sanjay V.", rating: 5, comment: "The best butter chicken I've ever tasted!", date: "2026-03-06" },
    { name: "Neha K.", rating: 5, comment: "Creamy, rich, and perfectly spiced. Heaven!", date: "2026-03-02" },
    { name: "Rajesh J.", rating: 5, comment: "Worth every rupee. Restaurant quality at home.", date: "2026-02-26" },
  ]},
  "Paneer Tikka Masala": { rating: 4.7, count: 41, reviews: [
    { name: "Pooja A.", rating: 5, comment: "Paneer is so soft and the gravy is incredible.", date: "2026-03-05" },
    { name: "Amit K.", rating: 4, comment: "Great flavors, generous paneer pieces.", date: "2026-02-28" },
  ]},
  "Masala Dosa": { rating: 4.5, count: 23, reviews: [
    { name: "Karthik N.", rating: 5, comment: "Crispy dosa with perfect potato filling!", date: "2026-03-04" },
    { name: "Meena I.", rating: 4, comment: "Authentic South Indian taste. Loved the chutneys.", date: "2026-02-27" },
  ]},
  "Margherita Pizza": { rating: 4.6, count: 36, reviews: [
    { name: "Rohan G.", rating: 5, comment: "Perfect crust, fresh mozzarella. Simply the best!", date: "2026-03-06" },
    { name: "Sneha R.", rating: 4, comment: "Classic and delicious. Could use more basil.", date: "2026-03-01" },
    { name: "Vikram S.", rating: 5, comment: "Wood-fired perfection! Tastes like Italy.", date: "2026-02-24" },
  ]},
  "Tiramisu": { rating: 4.8, count: 29, reviews: [
    { name: "Priya P.", rating: 5, comment: "Heavenly dessert! Rich coffee flavor and creamy layers.", date: "2026-03-05" },
    { name: "Anita D.", rating: 5, comment: "Best tiramisu I've had. Will order again!", date: "2026-02-28" },
  ]},
  "Dragon Roll": { rating: 4.7, count: 31, reviews: [
    { name: "Arjun R.", rating: 5, comment: "Fresh fish, perfect rice. Outstanding sushi!", date: "2026-03-04" },
    { name: "Deepa M.", rating: 4, comment: "Beautiful presentation and great taste.", date: "2026-02-26" },
  ]},
};

function getItemReviewData(itemName: string) {
  if (MOCK_ITEM_REVIEWS[itemName]) return MOCK_ITEM_REVIEWS[itemName];
  const hash = itemName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rating = 3.5 + (hash % 15) / 10;
  const count = 5 + (hash % 30);
  return { rating: Math.round(rating * 10) / 10, count, reviews: [
    { name: "Happy Customer", rating: Math.ceil(rating), comment: "Really enjoyed this dish! Would recommend.", date: "2026-02-20" },
  ]};
}

interface MenuItemCardProps {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
  isOpen?: boolean;
  deliveryFee?: number;
}

const MenuItemCard = ({ item, restaurantId, restaurantName }: MenuItemCardProps) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((ci) => ci.menuItem.id === item.id);
  const reviewData = getItemReviewData(item.name);

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
        <p className="mt-2 font-semibold text-card-foreground">₹{item.price.toFixed(2)}</p>

        {/* Rating & Reviews */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="font-medium text-card-foreground">{reviewData.rating}</span>
              <span>({reviewData.count} reviews)</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">{item.name} — Reviews</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 py-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-5 w-5 ${s <= Math.round(reviewData.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-lg font-bold text-card-foreground">{reviewData.rating}</span>
              <span className="text-sm text-muted-foreground">({reviewData.count} reviews)</span>
            </div>
            <div className="space-y-3 pt-2">
              {reviewData.reviews.map((rev, i) => (
                <div key={i} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">{rev.name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{rev.comment}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(rev.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
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