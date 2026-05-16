import { useState } from "react";
import { Star, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAllReviews, useDeleteReview, AdminReview } from "@/hooks/useAdminReviews";

const AdminReviews = () => {
  const { data: reviews = [], isLoading } = useAllReviews();
  const deleteMut = useDeleteReview();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (review: AdminReview) => {
    try {
      setDeletingId(review._id);
      await deleteMut.mutateAsync(review._id);
      toast({ title: "Review deleted", description: "The review was removed." });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed",
        description: err?.response?.data?.message || "Failed to delete review.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${rating >= star ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`}
        />
      ))}
    </div>
  );

  const reviewerName = (r: AdminReview) =>
    r.user
      ? `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() ||
        r.user.email ||
        "Anonymous"
      : "Anonymous";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Reviews</h1>
        <p className="text-muted-foreground mt-2">Manage and moderate product reviews</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reviewer</TableHead>
              <TableHead className="w-[200px]">Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-[300px]">Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              // Bug #36: friendlier empty state for reviews
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Star className="h-8 w-8 opacity-40" />
                    <p className="font-medium">No reviews yet</p>
                    <p className="text-xs">Customer reviews will appear here once submitted.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell className="font-medium whitespace-nowrap">{reviewerName(review)}</TableCell>
                  <TableCell>
                    <span className="text-sm truncate block max-w-[200px]" title={review.product?.name || ""}>
                      {review.product?.name || "Unknown Product"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{review.rating}</span>
                      {renderStars(review.rating)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground line-clamp-2" title={review.comment}>
                      {review.comment}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          disabled={deleteMut.isPending && deletingId === review._id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{reviewerName(review)}"'s review. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(review)}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            Delete Review
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminReviews;
