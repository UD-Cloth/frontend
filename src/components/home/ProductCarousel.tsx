import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@/stores/productStore";

import { Skeleton } from "@/components/ui/skeleton";

interface ProductCarouselProps {
  title: string;
  description?: string;
  products: Product[];
  viewAllLink?: string;
  actionText?: string;
  isLoading?: boolean;
  className?: string;
  variant?: 'default' | 'primary';
}

export const ProductCarousel = ({ title, description, products, viewAllLink, actionText = "View All", isLoading, className, variant = 'default' }: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const isPrimary = variant === 'primary';

  return (
    <section className={`py-12 md:py-16 ${className || (isPrimary ? "bg-[#e33045]" : "bg-background")}`}>
      <div className="container px-4">
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <div className="space-y-1.5 pr-4">
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight ${isPrimary ? "text-white" : "text-slate-900"}`}>{title}</h2>
            {description && (
              <p className={`text-sm md:text-base max-w-xl ${isPrimary ? "text-white/95" : "text-slate-500"}`}>
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {viewAllLink && (
              <Button 
                variant={isPrimary ? "secondary" : "link"} 
                className={isPrimary ? "bg-white text-[#e33045] hover:bg-slate-50 font-semibold md:px-6 shadow-sm" : "text-primary text-sm md:text-base p-0 md:px-4"} 
                asChild
              >
                <Link to={viewAllLink}>{actionText}</Link>
              </Button>
            )}
            <div className="hidden md:flex gap-2">
              <Button
                variant={isPrimary ? "secondary" : "outline"}
                size="icon"
                aria-label="Scroll products left"
                className={`h-9 w-9 rounded-full ${isPrimary ? "bg-white/20 hover:bg-white/30 text-white border-none" : ""}`}
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant={isPrimary ? "secondary" : "outline"}
                size="icon"
                aria-label="Scroll products right"
                className={`h-9 w-9 rounded-full ${isPrimary ? "bg-white/20 hover:bg-white/30 text-white border-none" : ""}`}
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading ? (
            // Show 4 skeleton loaders
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[160px] sm:min-w-[180px] md:min-w-[240px] snap-start">
                <div className="group relative">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="w-[160px] sm:w-[200px] md:w-[260px] lg:w-[280px] shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center px-4">
              <p className="text-muted-foreground mb-2">New pieces are arriving soon.</p>
              <p className="text-sm">Check back later for updates to this collection.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
