import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Loader2, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";
import { Product } from "@/data/products";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addItem, isLoading } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const productId = product._id || product.id || "";
  const inWishlist = isInWishlist(productId);
  const displayPrice = product.price;
  const originalPrice = product.originalPrice;

  const discount = originalPrice && originalPrice > displayPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({ variant: "destructive", title: "Please select a size", description: "Choose a size before adding to cart." });
      return;
    }
    if (!selectedColor && product.colors && product.colors.length > 0) {
      toast({ variant: "destructive", title: "Please select a color", description: "Choose a color before adding to cart." });
      return;
    }

    const productImage = product.images && product.images.length > 0 ? product.images[0] : (product.image || "");

    addItem({
      productId,
      name: product.name,
      image: productImage,
      price: displayPrice,
      quantity,
      size: selectedSize,
      color: selectedColor || "",
    });
  };

  const handleWishlist = () => {
    inWishlist ? removeFromWishlist(productId) : addToWishlist(product as any);
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
          {originalPrice && originalPrice > displayPrice ? (
            <>
              <span className="text-lg text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
              <Badge variant={"secondary" as any} className="bg-primary/10 text-primary font-semibold text-sm">
                {discount}% OFF
              </Badge>
            </>
          ) : null}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Color: <span className="text-foreground">{selectedColor || "Select"}</span>
          </h3>
          <div className="flex gap-3">
            {product.colors.map((c: any) => {
              const colorName = typeof c === 'string' ? c : c.name;
              const colorHex = typeof c === 'string' ? c : c.hex;
              return (
              <button
                key={colorName}
                onClick={() => { setSelectedColor(colorName); setQuantity(1); }}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all duration-200",
                  selectedColor === colorName
                    ? "border-primary ring-2 ring-primary/30 ring-offset-2 scale-110"
                    : "border-border hover:scale-105 hover:shadow-md"
                )}
                style={{ backgroundColor: colorHex }}
                title={colorName}
                aria-label={`Color: ${colorName}`}
              />
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
              <Button variant={"link" as any} className="text-primary p-0 h-auto gap-1 text-xs font-semibold">
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
                        {measurements.map((m, i) => <TableCell key={`${size}-${i}`}>{m}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => { setSelectedSize(size); setQuantity(1); }}
              className={cn(
                "min-w-[52px] h-12 px-5 rounded-lg border-2 font-semibold text-sm transition-all duration-200",
                selectedSize === size
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border text-foreground hover:border-primary/50"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quantity</h3>
        <div className="flex items-center gap-1">
          <Button variant={"outline" as any} size={"icon" as any} className="h-10 w-10 rounded-lg" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-14 text-center font-semibold text-lg">{quantity}</span>
          <Button variant={"outline" as any} size={"icon" as any} className="h-10 w-10 rounded-lg" onClick={() => setQuantity((q) => Math.min(99, q + 1))}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button size={"lg" as any} className="flex-1 h-14 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow" onClick={handleAddToCart} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ShoppingBag className="h-5 w-5 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
        <Button
          size={"lg" as any}
          variant={"outline" as any}
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
          <span className="font-medium">Free delivery above ₹2000</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <RotateCcw className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium">15-day easy returns</span>
        </div>
      </div>

      {/* Description Accordion */}
      {/* Bug #214: Description accordion starts open by default */}
      <Accordion type="single" collapsible defaultValue="description" className="w-full">
        <AccordionItem value="description">
          <AccordionTrigger className="text-base font-semibold">Description</AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </AccordionContent>
        </AccordionItem>
        {product.fabric && (
          <AccordionItem value="fabric">
            <AccordionTrigger className="text-base font-semibold">Fabric & Care</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground leading-relaxed">{product.fabric}</p>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};
