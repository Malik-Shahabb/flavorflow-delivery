import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { restaurants } from "@/data/restaurants";

const CartPage = () => {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="mt-4 font-serif text-2xl text-foreground">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">Add items from a restaurant to get started</p>
        <Link to="/restaurants">
          <Button className="mt-6 rounded-full" size="lg">Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  const restaurant = restaurants.find((r) => r.id === items[0].restaurantId);
  const deliveryFee = restaurant?.deliveryFee || 2.99;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen pb-16">
      <div className="container max-w-2xl py-8">
        <Link to={`/restaurant/${items[0].restaurantId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to {items[0].restaurantName}
        </Link>

        <h1 className="font-serif text-3xl text-foreground">Your Cart</h1>
        <p className="text-muted-foreground mt-1">From {items[0].restaurantName}</p>

        <div className="mt-6 space-y-4">
          {items.map((ci) => (
            <div key={ci.menuItem.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
              <img src={ci.menuItem.image} alt={ci.menuItem.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-card-foreground truncate">{ci.menuItem.name}</h4>
                <p className="text-sm text-muted-foreground">${ci.menuItem.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(ci.menuItem.id, ci.quantity - 1)}>
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-6 text-center font-semibold text-card-foreground">{ci.quantity}</span>
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(ci.menuItem.id, ci.quantity + 1)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeItem(ci.menuItem.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h3 className="font-serif text-lg text-card-foreground">Order Summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-card-foreground">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout">
            <Button className="mt-6 w-full rounded-full" size="lg">
              Proceed to Checkout — ${total.toFixed(2)}
            </Button>
          </Link>
          <Button variant="ghost" className="mt-2 w-full text-muted-foreground" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
