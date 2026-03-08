import { useState } from "react";
import { Star, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface DeliveryRatingDialogProps {
  orderId: string;
}

const DeliveryRatingDialog = ({ orderId }: DeliveryRatingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    // Mock submission
    toast.success("Thanks for rating your delivery!");
    setSubmitted(true);
    setTimeout(() => setOpen(false), 1000);
  };

  if (submitted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Bike className="h-3.5 w-3.5" /> Rate Delivery
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Bike className="h-5 w-5 text-primary" /> Rate Your Delivery
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            How was your delivery experience for order #{orderId.slice(0, 8)}?
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hover || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-sm font-medium text-foreground">
              {rating === 1 && "Poor 😞"}
              {rating === 2 && "Below Average 😐"}
              {rating === 3 && "Good 🙂"}
              {rating === 4 && "Great 😊"}
              {rating === 5 && "Excellent 🤩"}
            </p>
          )}

          <Textarea
            placeholder="Any feedback for the delivery agent? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />

          <Button onClick={handleSubmit} className="w-full rounded-full">
            Submit Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryRatingDialog;
