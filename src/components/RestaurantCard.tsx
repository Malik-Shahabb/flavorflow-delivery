import { Link } from "react-router-dom";
import { Star, Clock, Truck } from "lucide-react";
import { Restaurant } from "@/data/restaurants";
import { Badge } from "@/components/ui/badge";

const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {!restaurant.isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
            <span className="rounded-full bg-card px-4 py-1.5 text-sm font-semibold text-foreground">
              Currently Closed
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {restaurant.tags.map((tag) => (
            <Badge key={tag} className="bg-primary text-primary-foreground text-xs shadow-md">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg text-card-foreground">{restaurant.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{restaurant.cuisine}</p>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium text-card-foreground">{restaurant.rating}</span>
            <span>({restaurant.reviewCount})</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {restaurant.deliveryTime}
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            ${restaurant.deliveryFee.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
