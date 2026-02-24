import { useState } from "react";
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Loader2, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Product } from "@/data/products";

interface ProductInfoProps {
  product: Product;
  onColorChange?: (index: number) => void;
}

export const ProductInfo = ({ product, onColorChange }: ProductInfoProps) => {
  const { addItem, isLoading } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const inWishlist = isInWishlist(product._id || product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const handleAddToCart = async () => {
    if (!selectedSize) { toast.error("Please select a size"); return; }
    if (!selectedColor && product.colors.length > 0) { toast.error("Please select a color"); return; }

    const variantId = `local-variant-${product._id || product.id}-${selectedSize}-${selectedColor || 'default'}`;
    const variantTitle = `${selectedSize}${selectedColor ? ` / ${selectedColor}` : ''}`;

    await addItem({
      product: product,
      variantId,
      variantTitle,
      price: { amount: product.price.toString(), currencyCode: "INR" },
      quantity,
      selectedOptions: [
        { name: "Size", value: selectedSize },
        ...(selectedColor ? [{ name: "Color", value: selectedColor }] : [])
      ]
    });

    toast.success("Added to cart!", {
      description: `${product.name} - ${variantTitle}`
    });
  };

  const handleWishlist = () => {
    inWishlist ? removeFromWishlist(product._id || product.id) : addToWishlist(product);
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
          <span className="text-3xl lg:text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold text-sm">
                {discount}% OFF
              </Badge>
            </>
          )}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Color Selection */}
      {product.colors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Color: <span className="text-foreground">{selectedColor || "Select"}</span>
          </h3>
          <div className="flex gap-3">
            {product.colors.map((color, idx) => (
              <button
                key={color.name}
                onClick={() => {
                  setSelectedColor(color.name);
                  if (onColorChange) onColorChange(idx);
                }}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all duration-200",
                  selectedColor === color.name
                    ? "border-primary ring-2 ring-primary/30 ring-offset-2 scale-110"
                    : "border-border hover:scale-105"
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
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
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
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
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-14 text-center font-semibold text-lg">{quantity}</span>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg" onClick={() => setQuantity((q) => q + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
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
          <span className="font-medium">Free delivery above ₹999</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <RotateCcw className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium">15-day easy returns</span>
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
            <p className="text-sm text-muted-foreground">{product.fabric}</p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Machine wash cold</li><li>Do not bleach</li><li>Tumble dry low</li><li>Iron on low heat</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="shipping" className="border-b-0 bg-secondary/30 rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">Shipping & Returns</AccordionTrigger>
          <AccordionContent>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• Free shipping on orders above ₹999</li>
              <li>• Delivery within 5-7 business days</li>
              <li>• 15-day easy return policy</li>
              <li>• COD available</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
