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

const MOCK_REVIEWS: Record<string, Review[]> = {
  "1": [
    { id: "m1", rating: 5, comment: "Best biryani in town! The flavors are incredible and portions are generous.", created_at: "2026-02-20T10:00:00Z", profiles: { full_name: "Rahul Sharma" } },
    { id: "m2", rating: 4, comment: "Great food, delivery was a bit slow but worth the wait.", created_at: "2026-02-18T14:30:00Z", profiles: { full_name: "Priya Patel" } },
    { id: "m3", rating: 5, comment: "Authentic taste, feels like home-cooked food. Will order again!", created_at: "2026-02-15T09:00:00Z", profiles: { full_name: "Amit Kumar" } },
  ],
  "2": [
    { id: "m4", rating: 4, comment: "Loved the paneer tikka! Fresh ingredients and great spice level.", created_at: "2026-03-01T12:00:00Z", profiles: { full_name: "Sneha Reddy" } },
    { id: "m5", rating: 5, comment: "The butter chicken is to die for. Best I've had outside a restaurant.", created_at: "2026-02-25T18:00:00Z", profiles: { full_name: "Vikram Singh" } },
    { id: "m6", rating: 3, comment: "Good food but packaging could be better. Curry leaked a bit.", created_at: "2026-02-22T20:00:00Z", profiles: { full_name: "Anita Desai" } },
  ],
  "3": [
    { id: "m7", rating: 5, comment: "Perfect dosas every time! Crispy and the chutneys are amazing.", created_at: "2026-03-05T08:00:00Z", profiles: { full_name: "Karthik Nair" } },
    { id: "m8", rating: 4, comment: "Fresh and tasty South Indian food. The sambar is outstanding.", created_at: "2026-03-02T11:00:00Z", profiles: { full_name: "Meena Iyer" } },
  ],
  "4": [
    { id: "m9", rating: 5, comment: "Incredible sushi! Fresh fish and perfectly seasoned rice.", created_at: "2026-03-04T19:00:00Z", profiles: { full_name: "Rohan Gupta" } },
    { id: "m10", rating: 4, comment: "Great Japanese food, the ramen is authentic and flavorful.", created_at: "2026-02-28T13:00:00Z", profiles: { full_name: "Deepa Menon" } },
    { id: "m11", rating: 5, comment: "Best tempura I've ever had. Everything was cooked to perfection.", created_at: "2026-02-26T17:00:00Z", profiles: { full_name: "Arjun Rao" } },
  ],
  "5": [
    { id: "m12", rating: 4, comment: "Delicious Italian food! The pasta is perfectly al dente.", created_at: "2026-03-06T20:00:00Z", profiles: { full_name: "Sanjay Verma" } },
    { id: "m13", rating: 5, comment: "The pizza is hands down the best in the city. Wood-fired perfection!", created_at: "2026-03-03T21:00:00Z", profiles: { full_name: "Neha Kapoor" } },
    { id: "m14", rating: 4, comment: "Good portions, great taste. The tiramisu is heavenly.", created_at: "2026-02-27T15:00:00Z", profiles: { full_name: "Rajesh Joshi" } },
    { id: "m15", rating: 3, comment: "Food was good but arrived lukewarm. Taste was still great though.", created_at: "2026-02-24T19:30:00Z", profiles: { full_name: "Pooja Agarwal" } },
  ],
};

const ReviewsList = ({ restaurantId }: { restaurantId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, user_id")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
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
      } else {
        // Fall back to mock reviews for static restaurants
        setReviews(MOCK_REVIEWS[restaurantId] || []);
      }
    };
    fetchReviews();
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
