import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Star, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import RestaurantCard from "@/components/RestaurantCard";
import { Restaurant } from "@/data/restaurants";
import { useRestaurants } from "@/hooks/useRestaurants";

const cuisineFilters = ["All", "Chinese", "Italian", "Indian", "Japanese", "American", "Mediterranean", "Desi"];

const RestaurantsPage = () => {
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showVegOnly, setShowVegOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(800);
  const [maxDeliveryFee, setMaxDeliveryFee] = useState(100);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "rating" | "delivery" | "price">("default");
  const { data: dbRestaurants } = useRestaurants();

  // Only approved DB restaurants — no static restaurants
  const allRestaurants: Restaurant[] = useMemo(() => {
    return (dbRestaurants || [])
      .filter((r) => r.is_approved)
      .map((r) => ({
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
  }, [dbRestaurants]);

  const filtered = useMemo(() => {
    let results = allRestaurants.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(search.toLowerCase());
      const matchCuisine =
        activeCuisine === "All" || r.cuisine.toLowerCase().includes(activeCuisine.toLowerCase());
      const matchOpen = !showOpenOnly || r.isOpen;
      const matchRating = r.rating >= minRating;
      const matchVeg = !showVegOnly || r.menu.some((m) => m.isVeg);
      const matchPrice = r.menu.length === 0 || r.menu.some((m) => m.price <= maxPrice);
      const matchDeliveryFee = r.deliveryFee <= maxDeliveryFee;
      return matchSearch && matchCuisine && matchOpen && matchRating && matchVeg && matchPrice && matchDeliveryFee;
    });

    if (sortBy === "rating") results.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "delivery") results.sort((a, b) => a.deliveryFee - b.deliveryFee);
    else if (sortBy === "price") results.sort((a, b) => {
      const avgA = a.menu.length > 0 ? a.menu.reduce((s, m) => s + m.price, 0) / a.menu.length : 0;
      const avgB = b.menu.length > 0 ? b.menu.reduce((s, m) => s + m.price, 0) / b.menu.length : 0;
      return avgA - avgB;
    });

    return results;
  }, [search, activeCuisine, showOpenOnly, showVegOnly, minRating, maxPrice, maxDeliveryFee, sortBy, allRestaurants]);

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
            <div className="flex gap-2">
              <Button
                variant={showOpenOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOpenOnly(!showOpenOnly)}
              >
                Open Now
              </Button>
              <Button
                variant={showVegOnly ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setShowVegOnly(!showVegOnly)}
              >
                <Leaf className="h-4 w-4" /> Veg Only
              </Button>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
            </div>
          </div>

          {/* Cuisine chips */}
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

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 rounded-lg border border-border bg-background p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Minimum Rating: {minRating > 0 ? `${minRating}+` : "Any"}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[0, 3, 3.5, 4, 4.5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs transition-colors ${
                          minRating === r
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {r === 0 ? "Any" : <><Star className="h-3 w-3 fill-current" />{r}+</>}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Max Item Price: ₹{maxPrice}
                  </label>
                  <Slider
                    value={[maxPrice]}
                    onValueChange={([v]) => setMaxPrice(v)}
                    min={200}
                    max={800}
                    step={50}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    Max Delivery Fee: ₹{maxDeliveryFee}
                  </label>
                  <Slider
                    value={[maxDeliveryFee]}
                    onValueChange={([v]) => setMaxDeliveryFee(v)}
                    min={30}
                    max={100}
                    step={10}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Sort By</label>
                  <div className="flex flex-wrap gap-1">
                    {([["default", "Relevance"], ["rating", "Top Rated"], ["delivery", "Lowest Fee"], ["price", "Lowest Price"]] as const).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSortBy(key)}
                        className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                          sortBy === key
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="container mt-8">
        <p className="mb-4 text-sm text-muted-foreground">{filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} found</p>
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
