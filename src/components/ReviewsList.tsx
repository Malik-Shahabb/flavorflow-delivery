import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: { full_name: string } | null;
}

const ReviewsList = ({ restaurantId }: { restaurantId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, user_id")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!data) return;

      // Fetch profile names for reviewers
      const userIds = [...new Set(data.map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));

      setReviews(
        data.map((r: any) => ({
          ...r,
          profiles: { full_name: profileMap.get(r.user_id) || "Customer" },
        }))
      );
    };
    fetch();
  }, [restaurantId]);

  if (reviews.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No reviews yet. Be the first to review!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-card-foreground">
              {r.profiles?.full_name || "Customer"}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= r.rating ? "fill-warning text-warning" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
          {r.comment && (
            <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(r.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
