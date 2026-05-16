import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/stores/productStore";
import { useWishlist } from "@/context/WishlistContext";
import { useCartStore } from "@/stores/cartStore";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  // Backend documents have `_id`; only legacy/demo products have `id`.
  // Without this fallback the link below renders `/product/undefined` and
  // the detail page hits its "not found" branch.
  const productId = product._id || product.id;
  const inWishlist = productId ? isInWishlist(productId) : false;

  const displayPrice = product.discountPrice || product.price;
  const originalPrice = product.discountPrice
    ? product.price
    : (product.originalPrice && product.originalPrice > product.price ? product.originalPrice : undefined);

  const discount = originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;
    if (inWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  const mainImage =
    (product.images && product.images.length > 0 ? product.images[0] : product.image) || "";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;

    const hasSizes = (product.sizes?.length ?? 0) > 0;
    const hasColors = (product.colors?.length ?? 0) > 0;
    const stockQty = (typeof product.stock === 'number' ? product.stock : product.countInStock) ?? 0;

    if (stockQty === 0) {
      toast.error("Out of stock");
      return;
    }

    // If size or color choices exist, send the user to the product page to choose.
    if (hasSizes || hasColors) {
      navigate(`/product/${productId}`);
      return;
    }

    addItem({
      productId,
      name: product.name,
      image: mainImage,
      price: displayPrice,
      quantity: 1,
      size: "",
      color: "",
    });
    toast.success("Added to cart!", { description: product.name });
  };

  return (
    <Link to={`/product/${productId}`} className="group flex flex-col h-full w-full">
      <div className="relative overflow-hidden rounded-xl bg-muted/40 transition-shadow duration-300 group-hover:shadow-md">
        {/* Image Container - Bulletproof Aspect Ratio (4:5 Portrait) */}
        <div className="relative w-full pt-[125%] overflow-hidden mix-blend-multiply bg-gray-50/50">
          {/* Bug #176: fallback alt text when product.name is empty */}
          {/* Bug #158: hover-only zoom (`@media (hover: hover)`) avoids stuck hover state on touch devices */}
          <img
            src={mainImage}
            alt={product.name || 'Product image'}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-in-out [@media(hover:hover)]:group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isNewArrival && (
            <Badge className="bg-black text-white hover:bg-black font-bold tracking-widest text-[10px] px-2 py-1 rounded-sm shadow-sm border-0">
              NEW
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="secondary" className="bg-red-600 text-white hover:bg-red-700 font-bold tracking-widest text-[10px] px-2 py-1 rounded-sm shadow-sm border-0">
              -{discount}%
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200 font-bold tracking-widest text-[10px] px-2 py-1 rounded-sm shadow-sm border-gray-300">
              SOLD OUT
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="secondary"
          size="icon"
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={inWishlist}
          className={cn(
            "absolute top-3 right-3 h-9 w-9 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-sm z-10 transition-all duration-300",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:-translate-y-2 md:group-hover:translate-y-0",
            inWishlist && "opacity-100 md:translate-y-0"
          )}
          onClick={handleWishlistClick}
        >
          <Heart
            className={cn("h-4 w-4", inWishlist ? "fill-red-500 text-red-500" : "text-gray-600")}
          />
        </Button>

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 opacity-100 translate-y-0 md:opacity-0 md:translate-y-full transition-all duration-300 ease-out md:group-hover:translate-y-0 md:group-hover:opacity-100 z-10">
          <Button
            onClick={handleQuickAdd}
            className="w-full bg-white/95 backdrop-blur-md text-black hover:bg-black hover:text-white transition-colors duration-300 rounded-sm font-bold tracking-widest shadow-lg text-[10px] md:text-sm h-8 md:h-10"
          >
            <ShoppingBag className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            QUICK ADD
          </Button>
        </div>
        
        {/* Dark gradient for quick add text contrast at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-gradient-to-t from-black/20 md:from-black/10 to-transparent opacity-100 md:opacity-0 transition-opacity duration-300 md:group-hover:opacity-100 z-0 pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="mt-4 flex flex-col flex-grow px-1">
        <h3 className="text-base font-medium line-clamp-2 text-gray-900 group-hover:text-black transition-colors mb-2 min-h-[48px]">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && (
              <span className="text-sm font-medium text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-100">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-gray-700">
              {product.rating} <span className="text-gray-400 font-normal">({product.reviewCount})</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
