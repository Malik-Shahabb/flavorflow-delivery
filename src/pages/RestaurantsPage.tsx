import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RestaurantCard from "@/components/RestaurantCard";
import { restaurants as staticRestaurants, Restaurant } from "@/data/restaurants";
import { useRestaurants } from "@/hooks/useRestaurants";

const cuisineFilters = ["All", "Chinese", "Italian", "Indian", "Japanese", "American", "Mediterranean"];

const RestaurantsPage = () => {
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const { data: dbRestaurants } = useRestaurants();

  const allRestaurants: Restaurant[] = useMemo(() => {
    const dbMapped: Restaurant[] = (dbRestaurants || []).map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      reviewCount: r.review_count,
      deliveryTime: r.delivery_time,
      deliveryFee: r.delivery_fee,
      minOrder: r.min_order,
      image: r.image,
      address: r.address,
      isOpen: r.is_open,
      tags: r.tags || [],
      menu: (r.menu || []).map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        image: m.image,
        category: m.category,
        isVeg: m.is_veg,
        isPopular: m.is_popular,
      })),
    }));
    return [...dbMapped, ...staticRestaurants];
  }, [dbRestaurants]);

  const filtered = useMemo(() => {
    return allRestaurants.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(search.toLowerCase());
      const matchCuisine =
        activeCuisine === "All" || r.cuisine.toLowerCase().includes(activeCuisine.toLowerCase());
      const matchOpen = !showOpenOnly || r.isOpen;
      return matchSearch && matchCuisine && matchOpen;
    });
  }, [search, activeCuisine, showOpenOnly, allRestaurants]);

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-card border-b border-border py-8">
        <div className="container">
          <h1 className="font-serif text-3xl text-foreground">All Restaurants</h1>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search restaurants or cuisines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showOpenOnly ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setShowOpenOnly(!showOpenOnly)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Open Now
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {cuisineFilters.map((c) => (
              <Badge
                key={c}
                variant={activeCuisine === c ? "default" : "secondary"}
                className="cursor-pointer select-none px-3 py-1 text-xs"
                onClick={() => setActiveCuisine(c)}
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="container mt-8">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No restaurants found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;
