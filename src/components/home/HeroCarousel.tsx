import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=600&fit=crop",
    title: "New Season Collection",
    subtitle: "Discover the latest trends in men's fashion",
    cta: "Shop Now",
    link: "/new-arrivals",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&h=600&fit=crop",
    title: "Up to 50% Off",
    subtitle: "Limited time sale on premium apparel",
    cta: "Shop Sale",
    link: "/sale",
  },
  {
    id: 3,
    image: "src/components/home/Black White Bold Fashion Product Promotion Landscape Banner-2.png",
    title: "Premium Collection",
    subtitle: "Elevate your style with our exclusive range",
    cta: "Explore",
    link: "/category/shirts",
  },
   {
    id: 4,
    image: "src/components/home/Embroidered Floral Patchwork Shorts-3.jpg",
    title: "Premium Collection",
    subtitle: "Elevate your style with our exclusive range",
    cta: "Explore",
    link: "/category/shirts",
  },
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative overflow-hidden bg-muted">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full relative">
            <div className="aspect-[21/9] md:aspect-[3/1] relative">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/50 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="container px-4">
                  <div className="max-w-xl text-background">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-1 sm:mb-2 animate-fade-in">
                      {slide.title}
                    </h2>
                    <p className="text-sm sm:text-lg md:text-xl mb-3 sm:mb-6 text-background/90 line-clamp-2">
                      {slide.subtitle}
                    </p>
                    <Button size="default" className="bg-primary hover:bg-primary/90 text-sm sm:text-base md:size-lg">
                      {slide.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Smaller on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 hover:bg-background"
        onClick={goToPrev}
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 hover:bg-background"
        onClick={goToNext}
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 rounded-full transition-all",
              index === currentSlide ? "w-8 bg-primary" : "w-2 bg-background/60"
            )}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};
