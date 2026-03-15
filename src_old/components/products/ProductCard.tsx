import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_IMAGE = "/placeholder.svg";

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem, setIsOpen } = useCartStore();
  const inWishlist = isInWishlist(product._id || product.id);
  const [imgError, setImgError] = useState(false);

  const isOOS = (product.countInStock ?? 1) <= 0;
  const isLowStock = !isOOS && (product.countInStock ?? 99) <= 5 && (product.countInStock ?? 99) > 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product._id || product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedSize = product.sizes?.[0] || "Default";
    const selectedColor = product.colors?.[0]?.name || "";
    const variantId = `local-variant-${product._id || product.id}-${selectedSize}-${selectedColor || "default"}`;
    const variantTitle = `${selectedSize}${selectedColor ? ` / ${selectedColor}` : ""}`;

    await addItem({
      product: product,
      variantId,
      variantTitle,
      price: { amount: product.price.toString(), currencyCode: "INR" },
      quantity: 1,
      selectedOptions: [
        { name: "Size", value: selectedSize },
        ...(selectedColor ? [{ name: "Color", value: selectedColor }] : []),
      ],
    });

    setIsOpen(true);
    toast.success("Added to cart!", { description: product.name });
  };

  const displayImage = imgError ? PLACEHOLDER_IMAGE : (product.image || PLACEHOLDER_IMAGE);

  return (
    <Link to={`/product/${product._id || product.id}`} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-muted",
          isOOS && "opacity-60 grayscale"
        )}
      >
        {/* Image */}
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOOS && (
            <Badge variant="destructive" className="font-semibold">Out of Stock</Badge>
          )}
          {isLowStock && (
            <Badge variant="secondary" className="bg-orange-500 text-white font-semibold text-[10px]">
              Only {product.countInStock} left!
            </Badge>
          )}
          {!isOOS && product.isNew && (
            <Badge className="bg-primary text-primary-foreground">NEW</Badge>
          )}
          {discount > 0 && (
            <Badge variant="secondary" className="bg-foreground text-background">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
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

        {/* Quick Add - shown on hover, hidden if OOS */}
        {!isOOS && (
          <div className="absolute bottom-2 left-2 right-2 hidden md:block opacity-0 transition-opacity group-hover:opacity-100">
            <Button className="w-full" size="sm" onClick={handleQuickAdd}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({(product as any).reviews?.length || product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
