import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import RestaurantCard from "@/components/RestaurantCard";
import { restaurants as staticRestaurants, Restaurant } from "@/data/restaurants";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { data: dbRestaurants } = useRestaurants();
  const { user } = useAuth();

  const allRestaurants: Restaurant[] = [
    ...(dbRestaurants || []).map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      reviewCount: r.review_count,
      deliveryTime: r.delivery_time,
      deliveryFee: r.delivery_fee,
      minOrder: r.min_order,
      image: r.image,
      address: r.address,
      isOpen: r.is_open,
      tags: r.tags || [],
      menu: (r.menu || []).map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        image: m.image,
        category: m.category,
        isVeg: m.is_veg,
        isPopular: m.is_popular,
      })),
    })),
    ...staticRestaurants,
  ];

  const featured = allRestaurants.filter((r) => r.isOpen).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-20 md:py-28">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl font-serif leading-tight text-primary-foreground md:text-6xl">
              Delicious Food,
              <br />
              Delivered Fast
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Order from the best local restaurants with easy, on-demand delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/restaurants">
                <Button size="lg" variant="secondary" className="gap-2 rounded-full font-semibold shadow-lg">
                  Browse Restaurants <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost" className="rounded-full text-primary-foreground hover:bg-primary-foreground/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/20" />
        <div className="absolute -bottom-10 right-40 h-40 w-40 rounded-full bg-primary-foreground/10" />
      </section>

      {/* Features */}
      <section className="border-b border-border bg-card py-12">
        <div className="container grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { icon: MapPin, title: "Wide Coverage", desc: "Restaurants from every corner of your city" },
            { icon: Clock, title: "Fast Delivery", desc: "Average delivery time under 30 minutes" },
            { icon: ShieldCheck, title: "Secure Payments", desc: "Your transactions are always protected" },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-start gap-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl text-foreground">Popular Near You</h2>
              <p className="mt-1 text-muted-foreground">Handpicked favorites from your area</p>
            </div>
            <Link to="/restaurants" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <RestaurantCard restaurant={r} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero-gradient py-16">
        <div className="container text-center">
          <h2 className="font-serif text-3xl text-primary-foreground">Own a Restaurant?</h2>
          <p className="mt-2 text-primary-foreground/80">Partner with FeastFleet and grow your business</p>
          <Link to="/register-restaurant">
            <Button size="lg" variant="secondary" className="mt-6 rounded-full font-semibold">
              Register Your Restaurant
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍽️</span>
            <span className="font-serif text-foreground">FeastFleet</span>
          </div>
          <p>© 2026 FeastFleet. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
