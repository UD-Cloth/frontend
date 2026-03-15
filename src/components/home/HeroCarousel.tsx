import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCMSData } from "@/hooks/useCMS";

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: cmsData } = useCMSData();
  const slides = cmsData?.heroSlides || [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

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
            <div className="aspect-[21/9] md:aspect-[3/1] relative bg-slate-200">
              {slide.image && (
                <img
                  src={slide.image}
                  // Bug #120: Descriptive alt text for hero carousel images
                  alt={`${slide.title} - ${slide.subtitle || 'Urban Drape promotional banner'}`}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/50 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center">
                <div className="container px-4">
                  <div className="max-w-xl text-background">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-1 sm:mb-2 animate-fade-in">
                      {slide.title}
                    </h2>
                    <p className="text-sm sm:text-lg md:text-xl mb-3 sm:mb-6 text-background/90 line-clamp-2">
                      {slide.subtitle}
                    </p>
                    <Button size="default" asChild className="bg-primary hover:bg-primary/90 text-sm sm:text-base md:size-lg">
                      <Link to={slide.link || '#'}>{slide.cta}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          {/* Navigation Arrows - Smaller on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 hover:bg-background"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 hover:bg-background"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Dots - Bug #292: Indicators on mobile now visible */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-3 rounded-full transition-all",
                  index === currentSlide ? "w-8 bg-primary" : "w-3 bg-background/60"
                )}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
