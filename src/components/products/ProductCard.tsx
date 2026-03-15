import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const productId = product._id || product.id || "";
  const inWishlist = isInWishlist(productId);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const displayPrice = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : product.originalPrice;

  const discount = originalPrice && originalPrice > displayPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product as any);
    }
  };

  const mainImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : "");

  // Bug #69/#206: Determine if out of stock
  const isOutOfStock = (product as any).stock === 0 || (product as any).status === 'inactive';

  return (
    <Link to={`/product/${productId}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-muted">
        {/* Image - Bug #131: Add loading="lazy" for performance */}
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
              isOutOfStock && "opacity-60"
            )}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {/* Bug #69: Out of stock badge */}
          {isOutOfStock ? (
            <Badge variant="secondary" className="bg-gray-700 text-white">Out of Stock</Badge>
          ) : (
            <>
              {(product.isNewArrival || product.isNewItem || product.isNew) && (
                <Badge className="bg-primary text-primary-foreground">NEW</Badge>
              )}
              {discount > 0 && (
                <Badge variant="secondary" className="bg-foreground text-background">
                  -{discount}%
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button - Always visible on mobile */}
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "absolute top-2 right-2 h-8 w-8 rounded-full transition-opacity",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100",
            inWishlist && "opacity-100"
          )}
          onClick={handleWishlistClick}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn("h-4 w-4", inWishlist && "fill-primary text-primary")}
          />
        </Button>

        {/* Quick Add - Hidden on mobile, shown on hover for desktop */}
        {!isOutOfStock && (
          <div className="absolute bottom-2 left-2 right-2 hidden md:block opacity-0 transition-opacity group-hover:opacity-100">
            <Button className="w-full" size="sm">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        {/* Bug #235: Show brand name on product card */}
        {(product as any).brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {(product as any).brand}
          </p>
        )}
        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        {isOutOfStock ? (
          <p className="text-sm text-muted-foreground">Out of Stock</p>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && originalPrice > displayPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};
