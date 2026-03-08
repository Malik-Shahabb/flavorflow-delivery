import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ShoppingBag, Search, Utensils, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: <Search className="h-8 w-8" />,
    title: "Browse Restaurants",
    description: "Discover restaurants near you. Filter by cuisine, rating, and more.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <Utensils className="h-8 w-8" />,
    title: "Choose Your Favorites",
    description: "Explore menus, check reviews, and find dishes you'll love.",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    icon: <ShoppingBag className="h-8 w-8" />,
    title: "Add to Cart",
    description: "Build your perfect order with just a few taps.",
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    icon: <CreditCard className="h-8 w-8" />,
    title: "Easy Checkout",
    description: "Pay with card, UPI, or cash on delivery — your choice.",
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    icon: <Truck className="h-8 w-8" />,
    title: "Track & Enjoy",
    description: "Follow your order in real-time until it reaches your door.",
    color: "bg-chart-3/10 text-chart-3",
  },
];

const OnboardingTour = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("feastfleet_onboarding_done");
    if (!seen) {
      // Small delay so page loads first
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("feastfleet_onboarding_done", "true");
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  if (!show) return null;

  const current = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary/50" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${current.color}`}>
              {current.icon}
            </div>
          </div>

          {/* Content */}
          <h2 className="text-center font-serif text-2xl text-foreground">{current.title}</h2>
          <p className="mt-2 text-center text-muted-foreground">{current.description}</p>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
            <Button onClick={handleNext} className="gap-2 rounded-full px-6">
              {step < steps.length - 1 ? (
                <>Next <ArrowRight className="h-4 w-4" /></>
              ) : (
                "Get Started! 🎉"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
