import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, ChefHat, Truck, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  { status: "confirmed", label: "Order Confirmed", icon: Package },
  { status: "preparing", label: "Preparing", icon: ChefHat },
  { status: "out-for-delivery", label: "Out for Delivery", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

const OrdersPage = () => {
  const { currentOrder, advanceOrderStatus } = useCart();

  if (!currentOrder) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Package className="h-16 w-16 text-muted-foreground/40" />
        <h2 className="mt-4 font-serif text-2xl text-foreground">No active orders</h2>
        <p className="mt-2 text-muted-foreground">Your order history will appear here</p>
        <Link to="/restaurants">
          <Button className="mt-6 rounded-full" size="lg">Order Now</Button>
        </Link>
      </div>
    );
  }

  const currentIdx = steps.findIndex((s) => s.status === currentOrder.status);

  return (
    <div className="min-h-screen pb-16">
      <div className="container max-w-2xl py-8">
        <h1 className="font-serif text-3xl text-foreground">Order Tracking</h1>
        <p className="text-muted-foreground mt-1">Order #{currentOrder.id}</p>

        {/* Status tracker */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`mt-2 text-xs text-center ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                  {i < steps.length - 1 && (
                    <div className="absolute" />
                  )}
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="mt-4 flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i <= currentIdx ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        {/* Order details */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h3 className="font-serif text-lg text-card-foreground">Order Details</h3>
          <p className="text-sm text-muted-foreground mt-1">{currentOrder.restaurantName}</p>
          <div className="mt-4 space-y-3">
            {currentOrder.items.map((ci) => (
              <div key={ci.menuItem.id} className="flex justify-between text-sm">
                <span className="text-card-foreground">
                  {ci.quantity}x {ci.menuItem.name}
                </span>
                <span className="text-muted-foreground">
                  ${(ci.menuItem.price * ci.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between font-bold text-card-foreground">
              <span>Total</span>
              <span>${currentOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Demo: advance status */}
        {currentOrder.status !== "delivered" && (
          <Button
            onClick={advanceOrderStatus}
            className="mt-6 w-full rounded-full gap-2"
            variant="outline"
          >
            Simulate Next Status <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {currentOrder.status === "delivered" && (
          <div className="mt-6 text-center">
            <p className="text-success font-semibold">🎉 Order delivered! Enjoy your meal!</p>
            <Link to="/restaurants">
              <Button className="mt-4 rounded-full" size="lg">Order Again</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
