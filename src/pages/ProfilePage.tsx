import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";

interface Profile {
  full_name: string;
  phone: string;
  avatar_url: string;
  address: string;
}

const ProfilePage = () => {
  const { user, isReady } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
    avatar_url: "",
    address: "",
  });

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, address")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
      } else if (data) {
        setProfile(data);
      } else {
        // Profile doesn't exist yet (user created before trigger), create it
        setProfile({
          full_name: user.user_metadata?.full_name || "",
          phone: user.user_metadata?.phone || "",
          avatar_url: "",
          address: "",
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, isReady, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...profile,
        });

      if (error) throw error;
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!isReady || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-card border-b border-border py-8">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="font-serif text-3xl text-foreground">My Profile</h1>
          <p className="mt-1 text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="container mt-8 max-w-lg space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={profile.full_name}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Delivery Address</Label>
            <Input
              value={profile.address}
              onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
              placeholder="123 Main Street, City"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Avatar URL</Label>
            <Input
              value={profile.avatar_url}
              onChange={(e) => setProfile((p) => ({ ...p, avatar_url: e.target.value }))}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full rounded-full gap-2" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
