import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, Heart, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
// Bug #34: Use cartStore so Move-to-Cart is visible in checkout
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem } = useCartStore();
  const [movingProductId, setMovingProductId] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleMoveToCart = async (product: any) => {
    try {
      setMovingProductId(product._id || product.id);

      const selectedSize = product.sizes?.[0] || "M";
      const selectedColor = product.colors?.[0] || "";

      addItem({
        productId: product._id || product.id,
        name: product.name,
        image: product.images?.[0] || product.image || '',
        price: product.price,
        quantity: 1,
        size: selectedSize,
        color: typeof selectedColor === 'object' ? (selectedColor as any)?.name || '' : selectedColor,
      });

      removeFromWishlist(product._id || product.id);
      toast.success("Moved to cart!", { description: product.name });
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setMovingProductId(null);
    }
  };

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    removeFromWishlist(productId);
    toast.success("Removed from wishlist", { description: productName });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            My Wishlist ({items.length})
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
              {items.map((product) => (
                <div key={product._id || product.id} className="group relative">
                  <Link to={`/product/${product._id || product.id}`}>
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                      <img
                        src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3">
                      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Bug #44: Show actual sale price (product.price) as primary */}
                        <span className="font-semibold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
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
                      onClick={() => handleMoveToCart(product)}
                      disabled={movingProductId === (product._id || product.id)}
                    >
                      {movingProductId === (product._id || product.id) ? (
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
                      onClick={() =>
                        handleRemoveFromWishlist(product._id || product.id, product.name)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
