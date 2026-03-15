import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PinchZoomImage } from "@/components/products/PinchZoomImage";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
  isNew?: boolean;
}

export const ProductImageGallery = ({ images, name, isNew }: ProductImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <div className="space-y-3">
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <div
          className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary cursor-zoom-in group"
          onClick={() => setIsZoomOpen(true)}
        >
          <img
            src={images[selectedImage]}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev + 1) % images.length);
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
          {isNew && (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-semibold tracking-wide">
              NEW
            </Badge>
          )}
          {/* Image counter */}
          <div className="absolute bottom-4 right-4 bg-foreground/60 text-background text-xs font-medium px-2.5 py-1 rounded-full">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-50 h-10 w-10 rounded-full bg-background/90 hover:bg-background"
            onClick={() => setIsZoomOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="relative w-full h-full flex items-center justify-center">
            <PinchZoomImage
              src={images[selectedImage]}
              alt={name}
              className="max-w-full max-h-[85vh] rounded-lg"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/90"
                  onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/90"
                  onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={cn(
              "flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden border-2 transition-all duration-200",
              selectedImage === index
                ? "border-primary shadow-md"
                : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <img src={image} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
