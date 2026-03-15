import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProductReviews, useAddReview } from "@/hooks/useProducts";
import { useAuthContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Bug #70/#71: Show product reviews and allow authenticated buyers to submit a review
export const ProductReviews = ({ productId }: { productId: string }) => {
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const addReview = useAddReview(productId);
  const { user } = useAuthContext();
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast({ variant: "destructive", title: "Rating required", description: "Please select a star rating." });
      return;
    }
    if (!comment.trim()) {
      toast({ variant: "destructive", title: "Comment required", description: "Please write a brief review." });
      return;
    }
    try {
      await addReview.mutateAsync({ rating, comment });
      toast({ title: "Review Submitted", description: "Thank you for your review!" });
      setRating(0);
      setComment("");
      setShowForm(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Review Failed", description: err.message || "Could not submit review." });
    }
  };

  return (
    <section className="border-t pt-8 mt-8">
      <div className="container px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Customer Reviews ({reviews.length})</h2>
          {user && !showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              Write a Review
            </Button>
          )}
        </div>

        {/* Review Form */}
        {showForm && user && (
          <form onSubmit={handleSubmit} className="mb-8 p-5 border rounded-xl bg-muted/30 space-y-4">
            <h3 className="font-semibold">Your Review</h3>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={cn(
                        "h-7 w-7 transition-colors",
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Comment</p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={addReview.isPending}>
                {addReview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-5">
            {reviews.map((review: any) => (
              <div key={review._id} className="border-b pb-5 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          review.rating >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-sm">
                    {review.user?.firstName} {review.user?.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {!user && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            <Link to="/auth?returnUrl=/product/" className="underline hover:text-foreground">Sign in</Link> to leave a review.
          </p>
        )}
      </div>
    </section>
  );
};
