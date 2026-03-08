import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, ChefHat, Truck, CheckCircle2, ArrowRight } from "lucide-react";
import ReviewDialog from "@/components/ReviewDialog";

const steps = [
  { status: "confirmed", label: "Order Confirmed", icon: Package },
  { status: "preparing", label: "Preparing", icon: ChefHat },
  { status: "out-for-delivery", label: "Out for Delivery", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

const OrdersPage = () => {
  const { orders, advanceOrderStatus } = useCart();

  if (orders.length === 0) {
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

  return (
    <div className="min-h-screen pb-16">
      <div className="container max-w-2xl py-8">
        <h1 className="font-serif text-3xl text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">{orders.length} order{orders.length > 1 ? "s" : ""}</p>

        <div className="mt-8 space-y-6">
          {orders.map((order, orderIdx) => {
            const currentIdx = steps.findIndex((s) => s.status === order.status);
            const isLatest = orderIdx === 0;

            return (
              <div key={order.id} className="rounded-xl border border-border bg-card p-4 space-y-4 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-serif text-base text-card-foreground sm:text-lg">Order #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">{order.restaurantName}</p>
                  </div>
                  <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${
                    order.status === "delivered"
                      ? "bg-success/10 text-success"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {steps.find((s) => s.status === order.status)?.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex gap-1">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${i <= currentIdx ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((ci) => (
                    <div key={ci.menuItem.id} className="flex justify-between text-sm">
                      <span className="text-card-foreground">
                        {ci.quantity}x {ci.menuItem.name}
                      </span>
                      <span className="text-muted-foreground">
                        ₹{(ci.menuItem.price * ci.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between font-bold text-card-foreground">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Advance button for latest non-delivered order */}
                {isLatest && order.status !== "delivered" && (
                  <Button
                    onClick={advanceOrderStatus}
                    className="w-full rounded-full gap-2"
                    variant="outline"
                  >
                    Simulate Next Status <ArrowRight className="h-4 w-4" />
                  </Button>
                )}

                {order.status === "delivered" && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-success">🎉 Delivered!</p>
                    {order.dbOrderId ? (
                      <ReviewDialog
                        orderId={order.dbOrderId}
                        restaurantId={order.items[0]?.restaurantId || ""}
                        restaurantName={order.restaurantName}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground">Review unavailable for this order</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
