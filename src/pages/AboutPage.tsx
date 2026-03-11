import { useState } from "react";
import { Users, Code2, Mail, Send, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const techStack = [
  { name: "React", desc: "Frontend UI library" },
  { name: "TypeScript", desc: "Type-safe JavaScript" },
  { name: "Tailwind CSS", desc: "Utility-first CSS framework" },
  { name: "Django", desc: "Backend framework (Python)" },
  { name: "PostgreSQL", desc: "Relational database" },
  { name: "Vite", desc: "Build tool & dev server" },
  { name: "React Router", desc: "Client-side routing" },
];

const features = [
  "User Authentication & Profiles",
  "Restaurant Registration & Management",
  "Menu Management (CRUD)",
  "Cart & Checkout with Payment UI",
  "Real-time Order Tracking",
  "Delivery Personnel Module",
  "Admin Dashboard & Approvals",
  "Reviews & Ratings System",
  "Search, Filters & Sorting",
  "Dark Mode & Night Light",
  "Responsive Design",
  "Role-based Access Control",
];

const AboutPage = () => {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setContactForm({ name: "", email: "", message: "" });
      toast.success("Message sent! We'll get back to you soon.");
    }, 1200);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero */}
      <div className="bg-card border-b border-border py-16">
        <div className="container text-center max-w-3xl">
          <h1 className="font-serif text-4xl text-foreground">About FeastFleet</h1>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            FeastFleet is a full-stack food delivery platform built as a mini project. It connects customers with restaurants and delivery partners through a seamless digital experience.
          </p>
        </div>
      </div>

      <div className="container mt-12 space-y-16 max-w-5xl">
        {/* Features */}
        <section>
          <h2 className="font-serif text-2xl text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" /> Key Features
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm text-card-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="font-serif text-2xl text-foreground flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" /> Tech Stack
          </h2>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {techStack.map((t) => (
              <div key={t.name} className="rounded-lg border border-border bg-card p-4 text-center">
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>


        {/* Contact Form */}
        <section>
          <h2 className="font-serif text-2xl text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" /> Contact Us
          </h2>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleContact} className="space-y-4 rounded-lg border border-border bg-card p-6">
              <div>
                <Label>Your Name</Label>
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="John Doe"
                  maxLength={100}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="john@example.com"
                  maxLength={255}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Your message..."
                  maxLength={1000}
                  rows={4}
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={isSending} className="w-full gap-2">
                <Send className="h-4 w-4" /> {isSending ? "Sending..." : "Send Message"}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Get in Touch</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>123 College Road, City, India</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>contact@feastfleet.com</span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground mb-2">Project Info</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is a mini project developed for academic purposes. It demonstrates a full-stack food delivery system with role-based access, real-time order tracking, and a responsive UI.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
