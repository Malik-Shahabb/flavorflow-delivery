import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MenuItemCard from "@/components/MenuItemCard";
import { restaurants as staticRestaurants, Restaurant, MenuItem } from "@/data/restaurants";
import { useCart } from "@/context/CartContext";
import { useMemo } from "react";
import { useRestaurant } from "@/hooks/useRestaurants";

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const { items, subtotal } = useCart();
  const { data: dbRestaurant, isLoading } = useRestaurant(id);

  // Try static data first, then DB
  const restaurant: Restaurant | null = useMemo(() => {
    const staticMatch = staticRestaurants.find((r) => r.id === id);
    if (staticMatch) return staticMatch;

    if (!dbRestaurant) return null;
    return {
      id: dbRestaurant.id,
      name: dbRestaurant.name,
      cuisine: dbRestaurant.cuisine,
      rating: dbRestaurant.rating,
      reviewCount: dbRestaurant.review_count,
      deliveryTime: dbRestaurant.delivery_time,
      deliveryFee: dbRestaurant.delivery_fee,
      minOrder: dbRestaurant.min_order,
      image: dbRestaurant.image,
      address: dbRestaurant.address,
      isOpen: dbRestaurant.is_open,
      tags: dbRestaurant.tags || [],
      menu: (dbRestaurant.menu || []).map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        image: m.image,
        category: m.category,
        isVeg: m.is_veg,
        isPopular: m.is_popular,
      })),
    };
  }, [id, dbRestaurant]);

  const categories = useMemo(() => {
    if (!restaurant) return [];
    return [...new Set(restaurant.menu.map((m) => m.category))];
  }, [restaurant]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-foreground">Restaurant not found</h2>
          <Link to="/restaurants">
            <Button variant="outline" className="mt-4">Back to Restaurants</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Banner */}
      <div className="relative h-56 md:h-72">
        <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <Link to="/restaurants" className="absolute left-4 top-4">
          <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Info */}
      <div className="container -mt-16 relative z-10">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap gap-2 mb-2">
            {restaurant.tags.map((t) => (
              <Badge key={t} className="bg-primary text-primary-foreground">{t}</Badge>
            ))}
            {!restaurant.isOpen && <Badge variant="destructive">Closed</Badge>}
          </div>
          <h1 className="font-serif text-3xl text-card-foreground">{restaurant.name}</h1>
          <p className="mt-1 text-muted-foreground">{restaurant.cuisine}</p>
          <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <strong className="text-card-foreground">{restaurant.rating}</strong> ({restaurant.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{restaurant.deliveryTime}</span>
            <span className="flex items-center gap-1"><Truck className="h-4 w-4" />${restaurant.deliveryFee.toFixed(2)} delivery</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{restaurant.address}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Minimum order: ${restaurant.minOrder.toFixed(2)}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="container mt-8">
        {categories.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No menu items available yet.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat} className="mb-8">
              <h2 className="font-serif text-xl text-foreground mb-4">{cat}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {restaurant.menu
                  .filter((m) => m.category === cat)
                  .map((item) => (
                    <MenuItemCard key={item.id} item={item} restaurantId={restaurant.id} restaurantName={restaurant.name} />
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating cart bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg p-4 shadow-lg">
          <div className="container flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{items.reduce((s, i) => s + i.quantity, 0)} items</p>
              <p className="text-lg font-bold text-card-foreground">${subtotal.toFixed(2)}</p>
            </div>
            <Link to="/cart">
              <Button size="lg" className="rounded-full bg-primary text-primary-foreground font-semibold">
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;
