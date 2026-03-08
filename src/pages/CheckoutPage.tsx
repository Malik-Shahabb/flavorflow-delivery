import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const CheckoutPage = () => {
  const { items, subtotal, placeOrder } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = items[0]?.deliveryFee ?? 2.99;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/payment");
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="container max-w-2xl py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>

        <h1 className="font-serif text-3xl text-foreground">Checkout</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Delivery */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-serif text-lg text-card-foreground">
              <MapPin className="h-5 w-5 text-primary" /> Delivery Address
            </h3>
            <div className="mt-4 grid gap-4">
              <div>
                <Label>Full Name</Label>
                <Input required placeholder="Rahul Sharma" className="mt-1" />
              </div>
              <div>
                <Label>Address</Label>
                <Input required placeholder="42, Connaught Place, Block A" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input required placeholder="New Delhi" className="mt-1" />
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input required placeholder="110001" className="mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-serif text-lg text-card-foreground">
              <Phone className="h-5 w-5 text-primary" /> Contact
            </h3>
            <div className="mt-4 grid gap-4">
              <div>
                <Label>Phone</Label>
                <Input required type="tel" placeholder="+91 98765 43210" className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input required type="email" placeholder="john@example.com" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>₹{deliveryFee.toFixed(2)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-card-foreground text-base"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-full" size="lg">
            Proceed to Payment — ₹{total.toFixed(2)}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
