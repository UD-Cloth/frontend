import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, Heart, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { formatPrice } from "@/lib/utils";
import { pcount } from "@/lib/pluralize";

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem, isLoading } = useCartStore();
  const [movingProductId, setMovingProductId] = useState<string | null>(null);

  const handleMoveToCart = async (productId: string) => {
    // Sprint 4 / BUG-F-021 + BUG-F-022: server-synced wishlist items use
    // `_id` (Mongo) rather than `id`, and may have only `image` (singular)
    // populated. Match on either, and fall back gracefully on the image.
    const product = items.find((p) => (p._id || p.id) === productId);
    if (!product) return;
    const id = product._id || product.id;
    setMovingProductId(productId);
    const selectedSize = product.sizes?.[0] || "";
    // Bug #1/#2: colors may be an array of objects ({name, hex, _id}) or strings.
    // CartDrawer renders `item.color` as text, so we must coerce to a string.
    const rawColor: any = product.colors?.[0];
    const selectedColor =
      typeof rawColor === "string"
        ? rawColor
        : rawColor && typeof rawColor === "object"
          ? rawColor.name || ""
          : "";
    // Bug #19: respect stock when moving from wishlist to cart.
    if (product.stock === 0) {
      toast.error("Out of stock", { description: product.name });
      setMovingProductId(null);
      return;
    }
    const image = product.images?.[0] || product.image || "";

    await addItem({
      productId: id,
      name: product.name,
      image,
      price: product.discountPrice || product.price,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
    });

    removeFromWishlist(productId);
    setMovingProductId(null);
    toast.success("Moved to cart!", { description: product.name });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="My wishlist" noindex description="Your saved Urban Drape favourites." />
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            My Wishlist ({pcount(items.length, "item")})
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save your favorite items to buy them later!
              </p>
              <Button asChild>
                <Link to="/">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((product) => {
                // Sprint 4 / BUG-F-021 + BUG-F-022: prefer Mongo _id, fall back
                // to legacy demo `id`. Image fallback handles backend payloads
                // that only carry the singular `image` field.
                const productId = product._id || product.id;
                const productImage =
                  product.images?.[0] ||
                  product.image ||
                  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop';
                return (
                <div key={productId} className="group relative">
                  <Link to={`/product/${productId}`}>
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted relative">
                      <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {product.stock === 0 && (
                          <span className="bg-gray-100 text-gray-800 font-bold tracking-widest text-[10px] px-2 py-1 rounded-sm shadow-sm border border-gray-300">
                            SOLD OUT
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-primary">
                          {formatPrice(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMoveToCart(productId)}
                      disabled={isLoading && movingProductId === productId}
                    >
                      {isLoading && movingProductId === productId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Move to Cart
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label="Remove from wishlist"
                      onClick={() => removeFromWishlist(productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
