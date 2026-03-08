import { ReactNode } from "react";
import { ShoppingBag, Package, Search, Utensils, Star, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  type: "cart" | "orders" | "search" | "restaurants" | "reviews" | "delivery";
  title?: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
}

const illustrations: Record<string, { icon: ReactNode; gradient: string }> = {
  cart: {
    icon: <ShoppingBag className="h-12 w-12" />,
    gradient: "from-primary/20 to-accent/20",
  },
  orders: {
    icon: <Package className="h-12 w-12" />,
    gradient: "from-chart-1/20 to-chart-2/20",
  },
  search: {
    icon: <Search className="h-12 w-12" />,
    gradient: "from-chart-3/20 to-chart-4/20",
  },
  restaurants: {
    icon: <Utensils className="h-12 w-12" />,
    gradient: "from-primary/20 to-chart-5/20",
  },
  reviews: {
    icon: <Star className="h-12 w-12" />,
    gradient: "from-chart-4/20 to-primary/20",
  },
  delivery: {
    icon: <Bike className="h-12 w-12" />,
    gradient: "from-chart-2/20 to-chart-1/20",
  },
};

const defaults: Record<string, { title: string; description: string; actionLabel: string; actionLink: string }> = {
  cart: {
    title: "Your cart is empty",
    description: "Add delicious items from a restaurant to get started",
    actionLabel: "Browse Restaurants",
    actionLink: "/restaurants",
  },
  orders: {
    title: "No orders yet",
    description: "Your order history will appear here once you place an order",
    actionLabel: "Order Now",
    actionLink: "/restaurants",
  },
  search: {
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for",
    actionLabel: "Clear Filters",
    actionLink: "/restaurants",
  },
  restaurants: {
    title: "No restaurants available",
    description: "Check back later for new restaurant listings in your area",
    actionLabel: "Go Home",
    actionLink: "/",
  },
  reviews: {
    title: "No reviews yet",
    description: "Be the first to share your experience",
    actionLabel: "Browse Restaurants",
    actionLink: "/restaurants",
  },
  delivery: {
    title: "No deliveries right now",
    description: "New delivery orders will appear here when available",
    actionLabel: "Go Home",
    actionLink: "/",
  },
};

const EmptyState = ({ type, title, description, actionLabel, actionLink }: EmptyStateProps) => {
  const { icon, gradient } = illustrations[type];
  const d = defaults[type];

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center px-4">
      {/* Illustration circle */}
      <div className={`relative mb-6`}>
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} blur-2xl scale-150 opacity-60`} />
        <div className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-primary`}>
          {icon}
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-primary/30 animate-bounce" />
        <div className="absolute -bottom-1 -left-3 h-2 w-2 rounded-full bg-accent/40 animate-bounce [animation-delay:0.3s]" />
        <div className="absolute top-1/2 -right-5 h-2 w-2 rounded-full bg-chart-2/40 animate-bounce [animation-delay:0.6s]" />
      </div>

      <h2 className="font-serif text-2xl text-foreground">{title || d.title}</h2>
      <p className="mt-2 max-w-sm text-muted-foreground">{description || d.description}</p>

      <Link to={actionLink || d.actionLink}>
        <Button className="mt-6 rounded-full" size="lg">
          {actionLabel || d.actionLabel}
        </Button>
      </Link>
    </div>
  );
};

export default EmptyState;
