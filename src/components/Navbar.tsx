import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, LogOut } from "lucide-react";
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

        <div className="flex items-center gap-3">
          <Link to="/restaurants">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <User className="h-5 w-5" />
                  <span className="hidden text-sm font-medium text-foreground md:inline">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <User className="h-5 w-5" />
                <span className="hidden md:inline">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
