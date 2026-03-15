import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ReviewItem } from "@/hooks/useProducts";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProductReviewsProps {
  productId: string;
  isLoggedIn: boolean;
  reviews?: ReviewItem[];
}

export const ProductReviews = ({ productId, isLoggedIn, reviews = [] }: ProductReviewsProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userInfoStr = localStorage.getItem("userInfo");
  const currentUserId = userInfoStr ? JSON.parse(userInfoStr)._id : null;

  const addReviewMutation = useMutation({
    mutationFn: async (body: { rating: number; comment: string }) => {
      const { data } = await api.post(`/products/${productId}/reviews`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      setComment("");
      setRating(5);
      toast({ title: "Review added" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({ title: "Please enter a comment", variant: "destructive" });
      return;
    }
    addReviewMutation.mutate({ rating, comment: comment.trim() });
  };

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { data } = await api.delete(`/products/${productId}/reviews/${reviewId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast({ title: "Review deleted successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error deleting review", description: err.message, variant: "destructive" });
    },
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="border-t pt-8 mt-8">
      <h2 className="text-xl font-semibold mb-4">
        Reviews ({reviews.length})
      </h2>

      {isLoggedIn && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-lg bg-secondary/30 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Your rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className="p-1 rounded focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${r <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Your review</label>
            <Input
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <Button type="submit" disabled={addReviewMutation.isPending}>
            {addReviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
          </Button>
        </form>
      )}

      {!isLoggedIn && (
        <p className="text-sm text-muted-foreground mb-4">
          <Link to="/auth" className="text-primary underline">Sign in</Link> to leave a review.
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review: ReviewItem) => (
            <li key={review._id} className="border-b pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">
                  {review.user?.firstName} {review.user?.lastName}
                </span>
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <Star
                      key={r}
                      className={`h-4 w-4 ${r <= review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                        }`}
                    />
                  ))}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>

              {/* Delete Button for Author */}
              {isLoggedIn && review.user?._id === currentUserId && (
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                    onClick={() => deleteReviewMutation.mutate(review._id)}
                    disabled={deleteReviewMutation.isPending}
                  >
                    {deleteReviewMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
