import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { useAddReview } from "@/hooks/useProducts";
import { useAuthContext } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// Sprint 5 / BUG-F-038: review submissions hit the real backend (`useAddReview`)
// instead of mutating the demo `useReviewStore`. Backend enforces "must have
// purchased" + per-IP rate limit (Sprint 2). User identity is taken from the
// JWT, so we no longer collect a separate name field.

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating.").max(5),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters long.")
    .max(2000, "Review must be 2000 characters or less."),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ productId, onSuccess }: ReviewFormProps) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const { user } = useAuthContext();
  const addReviewMutation = useAddReview(productId);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user) {
      toast.error("Please sign in to submit a review.");
      return;
    }
    try {
      await addReviewMutation.mutateAsync({
        rating: Math.round(data.rating),
        comment: data.comment,
      });
      toast.success("Review submitted! Thank you for your feedback.");
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        toast.error("Please sign in to submit a review.");
      } else if (status === 403) {
        toast.error("Reviews are limited to verified purchasers.");
      } else if (status === 409) {
        toast.error("You've already reviewed this product.");
      } else if (status === 429) {
        toast.error("You've submitted too many reviews recently. Please try again later.");
      } else {
        toast.error(error?.response?.data?.message || "Failed to submit review. Please try again.");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={field.value === star}
                      aria-label={`${star} star${star === 1 ? '' : 's'}`}
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded transition-transform hover:scale-110"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => field.onChange(star)}
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors duration-200",
                          (hoveredStar || field.value) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted-foreground hover:fill-amber-400/50"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us what you think about this product..."
                  className="min-h-[120px] resize-none bg-background"
                  maxLength={2000}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full font-bold"
          disabled={addReviewMutation.isPending || !form.formState.isValid}
        >
          {addReviewMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </Form>
  );
};
