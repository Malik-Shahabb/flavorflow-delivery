import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import RestaurantCard from "@/components/RestaurantCard";
import { Restaurant } from "@/data/restaurants";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useAuth } from "@/context/AuthContext";
import heroImage from "@/assets/hero-food.jpg";

const Index = () => {
  const { data: dbRestaurants } = useRestaurants();
  const { user } = useAuth();

  // Only show approved DB restaurants (no static restaurants)
  const allRestaurants: Restaurant[] = (dbRestaurants || [])
    .filter((r) => r.is_approved)
    .map((r) => ({
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
    }));

  const featured = allRestaurants.filter((r) => r.isOpen).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 md:py-28">
        <img src={heroImage} alt="Delicious food spread" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
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
            <p className="mt-4 text-lg text-primary-foreground/80 md:text-xl">
              Order from the best local restaurants with easy, contactless delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/restaurants">
                <Button size="lg" className="rounded-full gap-2 text-base">
                  Order Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              {!user && (
                <Link to="/login">
                  <Button size="lg" variant="outline" className="rounded-full text-base bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card py-16 border-b border-border">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: MapPin, title: "Live Tracking", desc: "Track your order in real-time from restaurant to your doorstep" },
              { icon: Clock, title: "Fast Delivery", desc: "Average delivery in 30-40 minutes from confirmed restaurants" },
              { icon: ShieldCheck, title: "Safe & Secure", desc: "Contactless delivery with verified restaurant partners" },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-serif text-lg text-card-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-foreground md:text-3xl">Featured Restaurants</h2>
            <Link to="/restaurants" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="mt-8 text-center text-muted-foreground py-12">No restaurants available yet. Check back soon!</p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
