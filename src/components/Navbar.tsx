import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { ShoppingCart, User, Search, LogOut, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <span className="font-serif text-xl text-foreground">FeastFleet</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/restaurants" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Restaurants
          </Link>
          <Link to="/orders" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            My Orders
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/restaurants">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <div className="flex items-center gap-0.5">
              <NotificationBell />
              <Link to="/owner-dashboard">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground" title="Owner Dashboard">
                  <Store className="h-4 w-4" />
                </Button>
              </Link>
              <div className="ml-1 h-5 w-px bg-border" />
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-full px-2.5 text-muted-foreground hover:text-foreground">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="hidden text-xs font-medium text-foreground md:inline">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="h-9 rounded-full px-4 text-xs font-medium">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
