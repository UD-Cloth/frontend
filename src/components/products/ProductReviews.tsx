import { useState } from "react";
import { Star, MessageSquarePlus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProductReviews } from "@/hooks/useProducts";
import { ReviewForm } from "./ReviewForm";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  productId: string;
}

// Sprint 5 / BUG-F-037: read reviews from the backend (`useProductReviews`)
// instead of the demo `useReviewStore`. Reviews submitted via ReviewForm
// (also rewired) now actually persist and show up here.
export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { data: reviews = [], isLoading, error } = useProductReviews(productId);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            rating >= star
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground"
          )}
        />
      ))}
    </div>
  );

  const reviewerName = (r: any): string => {
    const u = r?.user;
    if (!u) return "Anonymous";
    return [u.firstName, u.lastName].filter(Boolean).join(" ") || "Anonymous";
  };

  return (
    <div className="space-y-8 animate-fade-in py-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border border-dashed">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-foreground">{averageRating}</span>
              <span className="text-xs text-muted-foreground">out of 5</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>

        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="font-bold rounded-xl shadow-md min-w-[200px]">
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-6 sm:rounded-2xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl">Write a Review</DialogTitle>
            </DialogHeader>
            <ReviewForm
              productId={productId}
              onSuccess={() => setIsReviewModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-sm text-destructive">
            Could not load reviews right now. Please refresh.
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 px-4 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <h3 className="text-lg font-bold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to share your thoughts on this product!</p>
            <Button variant="outline" onClick={() => setIsReviewModalOpen(true)}>
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Write the first review
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {reviews.map((review: any) => (
              <div
                key={review._id}
                className="bg-card border border-border/60 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{reviewerName(review)}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.createdAt ? format(new Date(review.createdAt), 'MMMM d, yyyy') : ''}
                    </p>
                  </div>
                  <div className="bg-secondary/50 p-1.5 rounded-lg">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
