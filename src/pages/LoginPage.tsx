import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isRegister ? "Account created! (Demo)" : "Logged in! (Demo)");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-card">
        <div className="text-center">
          <span className="text-3xl">🍽️</span>
          <h1 className="mt-2 font-serif text-2xl text-card-foreground">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister ? "Sign up to start ordering" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <div>
              <Label>Full Name</Label>
              <Input required placeholder="John Doe" className="mt-1" />
            </div>
          )}
          <div>
            <Label>Email</Label>
            <Input required type="email" placeholder="john@example.com" className="mt-1" />
          </div>
          <div>
            <Label>Password</Label>
            <Input required type="password" placeholder="••••••••" className="mt-1" />
          </div>
          {isRegister && (
            <div>
              <Label>Phone Number</Label>
              <Input type="tel" placeholder="+1 (555) 000-0000" className="mt-1" />
            </div>
          )}
          <Button type="submit" className="w-full rounded-full" size="lg">
            {isRegister ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
