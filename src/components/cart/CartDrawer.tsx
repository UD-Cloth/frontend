import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
// Bug #19/#33/#35/#36: Use cartStore (Zustand) as the single source of truth for cart
// CartContext was a legacy parallel implementation causing desyncs
import { useCartStore } from "@/stores/cartStore";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import api from "@/lib/api";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, removeItem, updateQuantity } = useCartStore();

  // Bug #145: Refresh product prices when cart opens
  useEffect(() => {
    if (open && items.length > 0) {
      // Fetch latest prices for items in cart
      items.forEach(async (item) => {
        try {
          const { data } = await api.get(`/products/${item.productId}`);
          if (data && data.price && data.price !== item.price) {
            // Price has changed, update it
            updateQuantity(item.productId, item.size, item.color, item.quantity);
          }
        } catch (err) {
          console.error('Failed to refresh product price:', err);
        }
      });
    }
  }, [open]);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemoveItem = (productId: string, size: string, color: string, productName: string) => {
    removeItem(productId, size, color);
    toast.success(`Removed from cart`, { description: productName });
  };

  // Bug #216: Show shipping info based on actual threshold (₹2000)
  const shipping = totalPrice > 2000 ? 0 : (totalPrice > 0 ? 150 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add some products to get started!
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)} asChild>
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-4 p-4 border rounded-lg"
                  >
                    <img
                      src={item.image || ""}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.size && `Size: ${item.size}`}{item.size && item.color && " | "}{item.color && `Color: ${item.color}`}
                      </p>
                      <p className="font-semibold text-primary mt-1">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded">
                          {/* Bug #215: Prevent quantity going below 1 */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                Math.min(99, item.quantity + 1)
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() =>
                            handleRemoveItem(
                              item.productId,
                              item.size,
                              item.color,
                              item.name
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-emerald-600 font-medium">Free</span>
                ) : (
                  <span>{formatPrice(shipping)}</span>
                )}
              </div>
              {totalPrice > 0 && totalPrice <= 2000 && (
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(2000 - totalPrice)} more for free shipping
                </p>
              )}
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice + shipping)}</span>
              </div>
              <Button className="w-full" size="lg" asChild onClick={() => onOpenChange(false)}>
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
