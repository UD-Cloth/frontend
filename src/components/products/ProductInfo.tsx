import { useState } from "react";
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Loader2, Ruler, Share2 } from "lucide-react";
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
  const { addItem, isLoading, setIsOpen } = useCartStore();
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

    setIsOpen(true);
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
          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
            {[1, 2, 3, 4, 5].map((s) => {
              const rating = product.rating || 0;
              if (s <= Math.floor(rating)) {
                return <Star key={s} className="h-4 w-4 fill-primary text-primary" />;
              } else if (s - 0.5 <= rating) {
                return (
                  <span key={s} className="relative inline-block h-4 w-4">
                    <Star className="h-4 w-4 text-muted-foreground/40 absolute inset-0" />
                    <span className="absolute inset-0 overflow-hidden w-[50%]">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    </span>
                  </span>
                );
              }
              return <Star key={s} className="h-4 w-4 text-muted-foreground/40" />;
            })}
            <span className="font-semibold text-sm text-primary ml-1">{product.rating}</span>
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
                <DialogTitle className="text-2xl font-bold tracking-tight">Size Guide</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 my-4">
                <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md border inline-block">
                  <span className="font-semibold text-foreground">Note:</span> All measurements are in inches.
                </p>
                <div className="border rounded-lg overflow-hidden relative">
                  <Table>
                    <TableHeader className="bg-secondary/50">
                      <TableRow>
                        <TableHead className="font-bold text-foreground h-12">Size</TableHead>
                        <TableHead className="font-bold text-foreground h-12">Chest ("in)</TableHead>
                        <TableHead className="font-bold text-foreground h-12">Waist ("in)</TableHead>
                        <TableHead className="font-bold text-foreground h-12">Shoulder ("in)</TableHead>
                        <TableHead className="font-bold text-foreground h-12 mt-0">Length ("in)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        ["S", "36 - 38", "30 - 32", "16", "27"],
                        ["M", "38 - 40", "32 - 34", "17", "28"],
                        ["L", "40 - 42", "34 - 36", "18", "29"],
                        ["XL", "42 - 44", "36 - 38", "19", "30"],
                        ["XXL", "44 - 46", "38 - 40", "20", "31"],
                      ].map(([size, ...measurements]) => (
                        <TableRow key={size} className="hover:bg-secondary/20 transition-colors">
                          <TableCell className="font-semibold text-foreground py-4">{size}</TableCell>
                          {measurements.map((m, i) => <TableCell key={i} className="py-4 text-muted-foreground">{m}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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

      {/* Social Sharing */}
      <div className="flex items-center gap-3">
        <Share2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Share:</span>
        <div className="flex gap-2">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + ' - Check this out! ' + window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center transition-colors"
            aria-label="Share on WhatsApp"
          >
            <svg className="h-4 w-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors"
            aria-label="Share on X"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 flex items-center justify-center transition-colors"
            aria-label="Share on Facebook"
          >
            <svg className="h-4 w-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          </a>
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
