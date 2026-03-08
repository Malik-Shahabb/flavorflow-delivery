import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Store, ShoppingBag, Bike } from "lucide-react";
import logo from "@/assets/logo.png";

type Role = "customer" | "owner" | "delivery" | null;

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("bike");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && user) {
      navigate("/");
    }
  }, [user, isReady, navigate]);

  if (!isReady) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (user) return null;

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent! Check your email.", { duration: 6000 });
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, phone, role: selectedRole },
          },
        });
        if (error) throw error;

        // If delivery role, create delivery profile after signup
        if (selectedRole === "delivery" && data.user) {
          // Insert delivery role
          await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: "delivery" as any,
          });
          // Insert delivery profile
          await supabase.from("delivery_profiles" as any).insert({
            user_id: data.user.id,
            vehicle_type: vehicleType,
            vehicle_number: vehicleNumber,
          });
        }

        toast.success("Account created! Please check your email and verify before signing in.", { duration: 6000 });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Logged in successfully!");
        if (selectedRole === "owner") navigate("/owner-dashboard");
        else if (selectedRole === "delivery") navigate("/delivery-dashboard");
        else navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const roleIcon = selectedRole === "owner" ? <Store className="h-6 w-6" /> : selectedRole === "delivery" ? <Bike className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />;
  const roleLabel = selectedRole === "owner" ? "restaurant owner" : selectedRole === "delivery" ? "delivery agent" : "customer";

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <img src={logo} alt="FeastFleet" className="mx-auto h-16 w-16" />
          <h1 className="mt-4 font-serif text-3xl text-foreground">Welcome to FeastFleet</h1>
          <p className="mt-2 text-muted-foreground">How would you like to continue?</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => setSelectedRole("customer")}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 transition-all hover:border-primary hover:shadow-card"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-card-foreground">Customer</h3>
                <p className="mt-1 text-xs text-muted-foreground">Browse restaurants & order food</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole("owner")}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 transition-all hover:border-primary hover:shadow-card"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Store className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-card-foreground">Restaurant Owner</h3>
                <p className="mt-1 text-xs text-muted-foreground">Manage your restaurant & orders</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole("delivery")}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 transition-all hover:border-primary hover:shadow-card"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chart-2/20 text-chart-2 transition-colors group-hover:bg-chart-2 group-hover:text-primary-foreground">
                <Bike className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-card-foreground">Delivery Agent</h3>
                <p className="mt-1 text-xs text-muted-foreground">Pick up & deliver orders</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {roleIcon}
          </div>
          <h1 className="mt-3 font-serif text-2xl text-card-foreground">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister ? `Sign up as a ${roleLabel}` : `Sign in as a ${roleLabel}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <div>
              <Label>Full Name</Label>
              <Input required placeholder="John Doe" className="mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          )}
          <div>
            <Label>Email</Label>
            <Input required type="email" placeholder="john@example.com" className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input required type="password" placeholder="••••••••" className="mt-1" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
          </div>
          {isRegister && (
            <div>
              <Label>Phone Number</Label>
              <Input required type="tel" placeholder="+91 98765 43210" className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}
          {isRegister && selectedRole === "delivery" && (
            <>
              <div>
                <Label>Vehicle Type</Label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="bike">Bike</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                </select>
              </div>
              <div>
                <Label>Vehicle Number</Label>
                <Input required placeholder="MH 12 AB 1234" className="mt-1" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
              </div>
            </>
          )}
          <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Sign In" : "Sign Up"}
          </button>
        </p>

        {!isRegister && (
          <button
            type="button"
            className="mt-2 w-full text-center text-sm font-medium text-primary hover:underline"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        )}

        <button
          type="button"
          onClick={() => { setSelectedRole(null); setIsRegister(false); setEmail(""); setPassword(""); setFullName(""); setPhone(""); setVehicleNumber(""); }}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Switch role
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
