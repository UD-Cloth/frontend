import { useState } from "react";
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Loader2, Ruler, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/context/WishlistContext";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { colorHexMap } from "@/data/products";
import { Product } from "@/stores/productStore";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addItem, isLoading } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isNotified, setIsNotified] = useState(false);

  const handleNotifySubmit = () => {
    if (!notifyEmail || !notifyEmail.includes('@')) {
      toast.error("Please enter a valid email to be notified.");
      return;
    }
    // Record interest (could hit a backend endpoint)
    setIsNotified(true);
    toast.success("You're on the list! We'll notify you when it restocks. 🎉");
  };

  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);
  const displayPrice = product.discountPrice || product.price;
  const originalPrice = product.discountPrice
    ? product.price
    : (product.originalPrice && product.originalPrice > product.price ? product.originalPrice : undefined);
  const stockQty = (typeof product.stock === 'number' ? product.stock : product.countInStock) ?? 0;
  const isOutOfStock = stockQty === 0;
  const isLowStock = stockQty > 0 && stockQty <= 5;

  // Normalize colors: backend sends [{name, hex}], legacy/demo data sends string[].
  const normalizedColors: { name: string; hex?: string }[] = (product.colors || []).map((c: any) =>
    typeof c === 'string' ? { name: c } : { name: c?.name, hex: c?.hex }
  );

  const discount = originalPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  // Sprint 3: formatPrice now imported from @/lib/utils.

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    if (!selectedSize) { toast.error("Please select a size"); return; }
    if (!selectedColor && normalizedColors.length > 0) { toast.error("Please select a color"); return; }

    const hasVariantStockTracker = product.variantStock && Object.keys(product.variantStock).length > 0;
    
    if (hasVariantStockTracker) {
      if (normalizedColors.length > 0) {
        const key = `${selectedColor}-${selectedSize}`;
        if ((product.variantStock[key] ?? 0) === 0) {
          toast.error("This specific color and size combination is sold out.");
          return;
        }
      } else {
        if ((product.variantStock[selectedSize] ?? 0) === 0) {
          toast.error("This size is sold out.");
          return;
        }
      }
    }

    await addItem({
      productId,
      name: product.name,
      image: product.images?.[0] || product.image || "",
      price: displayPrice,
      quantity,
      size: selectedSize,
      color: selectedColor,
    });

    // Bug #96: include product thumbnail in the toast for stronger visual confirmation
    const thumbSrc = product.images?.[0] || product.image || "";
    toast.success("Added to cart!", {
      description: `${product.name} - ${selectedSize}${selectedColor ? `, ${selectedColor}` : ''}`,
      icon: thumbSrc ? (
        <img
          src={thumbSrc}
          alt=""
          className="w-10 h-10 rounded object-cover"
        />
      ) : undefined,
    });
  };

  const handleWishlist = () => {
    inWishlist ? removeFromWishlist(productId) : addToWishlist(product);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Title & Rating */}
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-3">
          {product.name}
        </h1>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold text-sm text-primary">{product.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl lg:text-4xl font-bold text-primary">{formatPrice(displayPrice)}</span>
          {originalPrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold text-sm">
                {discount}% OFF
              </Badge>
            </>
          )}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Color Selection */}
      {normalizedColors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Color: <span className="text-foreground">{selectedColor || "Select"}</span>
          </h3>
          <div className="flex gap-3">
            {normalizedColors.map(({ name: colorName, hex: colorHex }) => {
              let isColorDisabled = false;
              if (isOutOfStock) {
                 isColorDisabled = true;
              } else if (product.variantStock && Object.keys(product.variantStock).length > 0 && product.sizes.length > 0) {
                 const totalColorStock = product.sizes.reduce((acc, s) => acc + (product.variantStock![`${colorName}-${s}`] || 0), 0);
                 if (totalColorStock === 0) isColorDisabled = true;
              }

              const swatchColor = colorHex || colorHexMap[colorName] || colorName.toLowerCase();

              return (
              <button
                key={colorName}
                disabled={isColorDisabled}
                onClick={() => setSelectedColor(colorName)}
                className={cn(
                  "relative w-10 h-10 rounded-full border-2 transition-all duration-200 overflow-hidden",
                  selectedColor === colorName
                    ? "border-primary ring-2 ring-primary/30 ring-offset-2 scale-110"
                    : "border-border hover:scale-105",
                  isColorDisabled && "opacity-40 cursor-not-allowed scale-100 hover:scale-100"
                )}
                style={{ backgroundColor: swatchColor }}
                title={colorName}
              >
                {isColorDisabled && (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                     <div className="w-[150%] h-[1.5px] bg-red-500/80 -rotate-45 drop-shadow-sm" />
                  </div>
                )}
              </button>
            )})}
          </div>
        </div>
      )}

      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Size</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-primary p-0 h-auto gap-1 text-xs font-semibold">
                <Ruler className="h-3.5 w-3.5" />
                Size Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Size Guide</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">All measurements are in inches.</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Size</TableHead>
                      <TableHead className="font-semibold">Chest</TableHead>
                      <TableHead className="font-semibold">Waist</TableHead>
                      <TableHead className="font-semibold">Shoulder</TableHead>
                      <TableHead className="font-semibold">Length</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["S", "36-38", "30-32", "16", "27"],
                      ["M", "38-40", "32-34", "17", "28"],
                      ["L", "40-42", "34-36", "18", "29"],
                      ["XL", "42-44", "36-38", "19", "30"],
                      ["XXL", "44-46", "38-40", "20", "31"],
                    ].map(([size, ...measurements]) => (
                      <TableRow key={size}>
                        <TableCell className="font-medium">{size}</TableCell>
                        {measurements.map((m, i) => <TableCell key={i}>{m}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            let isSizeDisabled = false;
            const hasVariantStockTracker = product.variantStock && Object.keys(product.variantStock).length > 0;
            
            if (isOutOfStock) {
              isSizeDisabled = true;
            } else if (hasVariantStockTracker) {
              if (normalizedColors.length > 0) {
                if (selectedColor) {
                  const key = `${selectedColor}-${size}`;
                  if ((product.variantStock[key] ?? 0) === 0) isSizeDisabled = true;
                } else {
                  // No color selected. Check if this size is out of stock across ALL colors.
                  const totalSizeStock = normalizedColors.reduce((acc, c) => acc + (product.variantStock![`${c.name}-${size}`] || 0), 0);
                  if (totalSizeStock === 0) isSizeDisabled = true;
                }
              } else {
                if ((product.variantStock[size] ?? 0) === 0) isSizeDisabled = true;
              }
            }

            return (
              <button
                key={size}
                disabled={isSizeDisabled}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "relative min-w-[52px] h-12 px-5 rounded-lg border-2 font-semibold text-sm transition-all duration-200 overflow-hidden",
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border text-foreground hover:border-primary/50",
                  isSizeDisabled && "opacity-40 cursor-not-allowed bg-muted hover:border-border text-muted-foreground"
                )}
              >
                {size}
                {isSizeDisabled && (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <div className="w-[150%] h-[1.5px] bg-muted-foreground/50 -rotate-45" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity */}
      {!isOutOfStock && (
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quantity</h3>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-14 text-center font-semibold text-lg">{quantity}</span>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg" onClick={() => setQuantity((q) => Math.min(stockQty, q + 1))}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {isLowStock && (
          <p className="text-amber-600 text-sm font-medium mt-2 flex items-center gap-1">
            ⚡ Only {stockQty} left in stock!
          </p>
        )}
      </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {isOutOfStock ? (
          <div className="flex-1 flex flex-col gap-2">
             {!isNotified ? (
               <div className="flex gap-2">
                 <Input 
                   type="email"
                   placeholder="Enter your email" 
                   value={notifyEmail}
                   onChange={(e) => setNotifyEmail(e.target.value)}
                   className="flex-1 h-12"
                 />
                 <Button onClick={handleNotifySubmit} className="whitespace-nowrap px-4 h-12 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <Bell className="w-4 h-4 mr-2" /> Notify Me
                 </Button>
               </div>
             ) : (
               <div className="text-emerald-700 text-sm font-bold text-center py-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  ✓ You're on the waitlist! We'll email you soon.
               </div>
             )}
          </div>
        ) : (
          <Button size="lg" className="flex-1 h-14 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow" onClick={handleAddToCart} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        )}
        <Button
          size="lg"
          variant="outline"
          onClick={handleWishlist}
          className={cn(
            "h-14 w-14 rounded-xl border-2 transition-all duration-200",
            inWishlist ? "text-primary border-primary bg-primary/5" : "hover:border-primary/50"
          )}
        >
          <Heart className={cn("h-5 w-5", inWishlist && "fill-primary")} />
        </Button>
      </div>

      {/* Delivery Info */}
      <div className="flex flex-col sm:flex-row gap-4 py-5 px-5 bg-secondary/50 rounded-xl">
        <div className="flex items-center gap-3 text-sm">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium">Free delivery above ₹2,000</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <RotateCcw className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium">7-day easy returns</span>
        </div>
      </div>

      {/* Accordion */}
      <Accordion type="single" collapsible defaultValue="description" className="space-y-1">
        <AccordionItem value="description" className="border-b-0 bg-secondary/30 rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Product Description</AccordionTrigger>
          <AccordionContent><p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p></AccordionContent>
        </AccordionItem>
        <AccordionItem value="fabric" className="border-b-0 bg-secondary/30 rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Fabric & Care</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">{product.material}</p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Machine wash cold</li><li>Do not bleach</li><li>Tumble dry low</li><li>Iron on low heat</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shipping" className="border-b-0 bg-secondary/30 rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Shipping & Returns</AccordionTrigger>
          <AccordionContent>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• Free shipping on orders above ₹2,000</li>
              <li>• Delivery within 5-7 business days</li>
              <li>• 7-day easy return policy</li>
              <li>• COD available</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
