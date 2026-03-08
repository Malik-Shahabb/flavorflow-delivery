import { useState } from "react";
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

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);
    try {
      // Validate that IDs are valid UUIDs before submitting
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
        comment,
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("You've already reviewed this order.");
        } else {
          throw error;
        }
      } else {
        toast.success("Review submitted!");
        setOpen(false);
        onReviewSubmitted?.();
      }
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

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
            placeholder="Write a comment (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
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
