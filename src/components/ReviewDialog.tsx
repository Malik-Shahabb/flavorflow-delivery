import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface ReviewDialogProps {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  onReviewSubmitted?: () => void;
}

const ReviewDialog = ({ orderId, restaurantId, restaurantName, onReviewSubmitted }: ReviewDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Check if user already reviewed this order
  useEffect(() => {
    if (!user || !orderId) return;
    const checkExisting = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("order_id", orderId)
        .maybeSingle();
      if (data) setAlreadyReviewed(true);
    };
    checkExisting();
  }, [user, orderId]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(orderId) || !uuidRegex.test(restaurantId)) {
        toast.error("Cannot submit review for this order.");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        restaurant_id: restaurantId,
        order_id: orderId,
        rating,
        comment: comment.trim().slice(0, 500),
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("You've already reviewed this order.");
          setAlreadyReviewed(true);
        } else {
          throw error;
        }
      } else {
        toast.success("Review submitted!");
        setAlreadyReviewed(true);
        setOpen(false);
        onReviewSubmitted?.();
      }
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyReviewed) {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-warning text-warning" /> Reviewed
      </span>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Star className="h-4 w-4" /> Rate Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Rate {restaurantName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoveredRating(s)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    s <= (hoveredRating || rating)
                      ? "fill-warning text-warning"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {rating === 0 ? "Tap a star to rate" : `${rating} out of 5 stars`}
          </p>
          <Textarea
            placeholder="Write a comment (optional, max 500 chars)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="w-full rounded-full"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
