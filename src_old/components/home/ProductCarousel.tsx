import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@/data/products";

interface ProductCarouselProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

export const ProductCarousel = ({ title, products, viewAllLink }: ProductCarouselProps) => {
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

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{title}</h2>
          <div className="flex items-center gap-2">
            {viewAllLink && (
              <Button variant="link" className="text-primary text-sm md:text-base p-0 md:px-4" asChild>
                <Link to={viewAllLink}>View All</Link>
              </Button>
            )}
            <div className="hidden md:flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div key={product._id || product.id} className="min-w-[160px] sm:min-w-[180px] md:min-w-[240px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
