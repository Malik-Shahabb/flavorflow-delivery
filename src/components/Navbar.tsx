import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { ShoppingCart, User, Search, LogOut, Store, Moon, Sun, Menu, X, Settings, Bell, Shield, ClipboardList } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-14 items-center justify-between sm:h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={closeMobile}>
          <img src={logo} alt="FeastFleet logo" className="h-8 w-8 sm:h-10 sm:w-10" />
          <span className="font-serif text-lg text-foreground sm:text-xl">FeastFleet</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          <Link to="/restaurants" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Restaurants</Link>
          <Link to="/orders" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">My Orders</Link>
        </nav>

        {/* Desktop actions — minimal visible icons */}
        <div className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground" onClick={toggleTheme} title={theme === "light" ? "Dark mode" : "Light mode"}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{totalItems}</span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-full px-2.5 text-muted-foreground hover:text-foreground">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden text-xs font-medium text-foreground lg:inline max-w-[100px] truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/restaurants")} className="gap-2 cursor-pointer">
                  <Search className="h-4 w-4" /> Search Restaurants
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/owner-dashboard")} className="gap-2 cursor-pointer">
                  <Store className="h-4 w-4" /> Owner Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2 cursor-pointer">
                  <Shield className="h-4 w-4" /> Admin Panel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login"><Button size="sm" className="h-9 rounded-full px-4 text-xs font-medium">Sign In</Button></Link>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 md:hidden">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{totalItems}</span>
              )}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link to="/" onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Home</Link>
            <Link to="/restaurants" onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Restaurants</Link>
            <Link to="/orders" onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">My Orders</Link>
            {user && (
              <>
                <div className="my-1 h-px bg-border" />
                <Link to="/profile" onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted flex items-center gap-2">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link to="/owner-dashboard" onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted flex items-center gap-2">
                  <Store className="h-4 w-4" /> Owner Dashboard
                </Link>
                <Link to="/admin" onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Admin Panel
                </Link>
                <div className="my-1 h-px bg-border" />
                <button onClick={handleSignOut} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-muted flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            )}
            {!user && (
              <Link to="/login" onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-muted">Sign In</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;