import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Github, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-xl text-foreground">🍔 FeastFleet</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your favourite food, delivered fast. A modern food delivery platform connecting customers, restaurants, and delivery partners.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/restaurants" className="text-muted-foreground hover:text-primary transition-colors">Restaurants</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Login / Register</Link></li>
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">For Partners</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register-restaurant" className="text-muted-foreground hover:text-primary transition-colors">Register Restaurant</Link></li>
              <li><Link to="/delivery-dashboard" className="text-muted-foreground hover:text-primary transition-colors">Delivery Partners</Link></li>
              <li><Link to="/owner-dashboard" className="text-muted-foreground hover:text-primary transition-colors">Owner Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" /> 123 College Road, India
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" /> +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" /> contact@feastfleet.com
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FeastFleet — Mini Project. Built with React, TypeScript, Django & PostgreSQL.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
