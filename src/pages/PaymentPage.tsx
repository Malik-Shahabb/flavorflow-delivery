import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Smartphone, Banknote, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

type PaymentMethod = "card" | "upi" | "cod";

const PaymentPage = () => {
  const { items, subtotal, placeOrder } = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  const deliveryFee = items[0]?.deliveryFee ?? 2.99;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length > 2) return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    return cleaned;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();

    if (method === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) { toast.error("Enter a valid 16-digit card number"); return; }
      if (cardExpiry.length < 5) { toast.error("Enter a valid expiry date"); return; }
      if (cardCvv.length < 3) { toast.error("Enter a valid CVV"); return; }
    }
    if (method === "upi" && !upiId.includes("@")) { toast.error("Enter a valid UPI ID (e.g. name@upi)"); return; }

    setIsProcessing(true);
    setTimeout(() => {
      placeOrder(deliveryFee);
      toast.success(method === "cod" ? "Order placed! Pay on delivery." : "Payment successful! Order placed.");
      navigate("/orders");
    }, 2000);
  };

  const methods: { key: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: "card", label: "Credit / Debit Card", icon: <CreditCard className="h-5 w-5" />, desc: "Visa, Mastercard, RuPay" },
    { key: "upi", label: "UPI", icon: <Smartphone className="h-5 w-5" />, desc: "Google Pay, PhonePe, Paytm" },
    { key: "cod", label: "Cash on Delivery", icon: <Banknote className="h-5 w-5" />, desc: "Pay when order arrives" },
  ];

  return (
    <div className="min-h-screen pb-16">
      <div className="container max-w-2xl py-8">
        <Link to="/checkout" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Checkout
        </Link>

        <h1 className="font-serif text-3xl text-foreground">Payment</h1>
        <p className="text-muted-foreground mt-1">Choose your payment method</p>

        <form onSubmit={handlePay} className="mt-8 space-y-6">
          {/* Method Selection */}
          <div className="space-y-3">
            {methods.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethod(m.key)}
                className={`w-full flex items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                  method === m.key
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className={`rounded-full p-2 ${method === m.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {m.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
                {method === m.key && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </div>

          {/* Card Form */}
          {method === "card" && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4 animate-in fade-in-50">
              <div>
                <Label>Card Number</Label>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="mt-1 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="•••"
                    maxLength={4}
                    type="password"
                    className="mt-1 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI Form */}
          {method === "upi" && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4 animate-in fade-in-50">
              <div>
                <Label>UPI ID</Label>
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.trim())}
                  placeholder="yourname@upi"
                  maxLength={50}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 justify-center pt-2">
                {["GPay", "PhonePe", "Paytm"].map((app) => {
                  const upiHandles: Record<string, string> = { GPay: "okaxis", PhonePe: "ybl", Paytm: "paytm" };
                  return (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiId((prev) => {
                        const name = prev.split("@")[0] || "";
                        return name ? `${name}@${upiHandles[app]}` : `@${upiHandles[app]}`;
                      })}
                      className={`rounded-lg border px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
                        upiId.endsWith(`@${upiHandles[app]}`)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {app}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* COD */}
          {method === "cod" && (
            <div className="rounded-lg border border-border bg-card p-6 text-center animate-in fade-in-50">
              <Banknote className="h-10 w-10 text-primary mx-auto" />
              <p className="mt-3 text-foreground font-medium">Pay when your order arrives</p>
              <p className="text-sm text-muted-foreground mt-1">Keep ₹{total.toFixed(0)} ready for the delivery partner</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Delivery Fee</span><span>₹{deliveryFee.toFixed(2)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your payment info is secure & encrypted (simulated)</span>
          </div>

          <Button type="submit" className="w-full rounded-full" size="lg" disabled={isProcessing}>
            {isProcessing
              ? "Processing Payment..."
              : method === "cod"
              ? `Place Order — ₹${total.toFixed(2)}`
              : `Pay ₹${total.toFixed(2)}`}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
