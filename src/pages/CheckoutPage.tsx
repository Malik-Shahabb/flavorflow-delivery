import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const CheckoutPage = () => {
  const { items, subtotal, placeOrder } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod");

  const deliveryFee = items[0]?.deliveryFee ?? 2.99;
  const minOrder = items[0]?.minOrder ?? 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (fullName.trim().length < 2) {
      toast.error("Please enter a valid name (at least 2 characters)");
      return;
    }
    if (address.trim().length < 5) {
      toast.error("Please enter a valid address (at least 5 characters)");
      return;
    }
    if (city.trim().length < 2) {
      toast.error("Please enter a valid city");
      return;
    }
    if (!/^\d{5,6}$/.test(zip.trim())) {
      toast.error("Please enter a valid ZIP/PIN code (5-6 digits)");
      return;
    }
    if (!/^\+?[\d\s()-]{7,15}$/.test(phone.trim())) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Enforce minimum order
    if (minOrder > 0 && subtotal < minOrder) {
      toast.error(`Minimum order amount is ₹${minOrder.toFixed(2)}. Please add more items.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder(deliveryFee);
      toast.success("Order placed successfully!");
      navigate("/orders");
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="container max-w-2xl py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>

        <h1 className="font-serif text-3xl text-foreground">Checkout</h1>

        {minOrder > 0 && subtotal < minOrder && (
          <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            Minimum order is ₹{minOrder.toFixed(2)}. You need ₹{(minOrder - subtotal).toFixed(2)} more.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Delivery */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-serif text-lg text-card-foreground">
              <MapPin className="h-5 w-5 text-primary" /> Delivery Address
            </h3>
            <div className="mt-4 grid gap-4">
              <div>
                <Label>Full Name</Label>
                <Input required placeholder="John Doe" className="mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
              </div>
              <div>
                <Label>Address</Label>
                <Input required placeholder="123 Main Street, Apt 4" className="mt-1" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input required placeholder="New York" className="mt-1" value={city} onChange={(e) => setCity(e.target.value)} maxLength={50} />
                </div>
                <div>
                  <Label>ZIP / PIN Code</Label>
                  <Input required placeholder="10001" className="mt-1" value={zip} onChange={(e) => setZip(e.target.value)} maxLength={6} />
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
                <Input required type="tel" placeholder="+91 98765 43210" className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} />
              </div>
              <div>
                <Label>Email</Label>
                <Input required type="email" placeholder="john@example.com" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-serif text-lg text-card-foreground">
              <Wallet className="h-5 w-5 text-primary" /> Payment Method
            </h3>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex-1 rounded-lg border-2 p-4 text-center transition-colors ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5 text-card-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <p className="font-semibold">Cash on Delivery</p>
                <p className="text-xs mt-1">Pay when your order arrives</p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`flex-1 rounded-lg border-2 p-4 text-center transition-colors ${
                  paymentMethod === "upi"
                    ? "border-primary bg-primary/5 text-card-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <p className="font-semibold">UPI / Online</p>
                <p className="text-xs mt-1">Simulated payment</p>
              </button>
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

          <Button
            type="submit"
            className="w-full rounded-full"
            size="lg"
            disabled={isSubmitting || (minOrder > 0 && subtotal < minOrder)}
          >
            {isSubmitting ? "Processing..." : `Place Order — ₹${total.toFixed(2)}`}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
