import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCmsStore } from "@/stores/cmsStore";

// Sprint 6 / BUG-F-047 + BUG-F-048: HeroCarousel a11y.
// - Pause autoplay on hover/focus.
// - Honor `prefers-reduced-motion`.
// - role="region" + aria-roledescription="carousel".
// - Each slide is role="group" with aria-label, dots have aria-current/aria-label.
// - Image alt text is decorative when slide.title overlays it; keep slide.title.
export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const slides = useCmsStore(state => state.heroSlides);

  // Watch for `prefers-reduced-motion`.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReducedMotion(mql.matches);
    handler();
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (paused || reducedMotion) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, paused, reducedMotion]);

  if (!slides || slides.length === 0) return null;

  const goToSlide = (index: number) => setCurrentSlide(index);
  const goToPrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div
      className="relative overflow-hidden bg-muted"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Slides */}
      <div
        className={cn(
          "flex",
          reducedMotion ? undefined : "transition-transform duration-500 ease-out"
        )}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="min-w-full relative"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${idx + 1} of ${slides.length}: ${slide.title || ''}`}
            aria-hidden={idx !== currentSlide}
          >
            <div className="aspect-[21/9] md:aspect-[3/1] relative bg-slate-200">
              {slide.image && (
                <img
                  src={slide.image}
                  alt=""
                  aria-hidden="true"
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
                      <Link to={slide.link || '#'} tabIndex={idx === currentSlide ? 0 : -1}>{slide.cta}</Link>
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
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 hover:bg-background"
            onClick={goToPrev}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background/80 hover:bg-background"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" role="tablist" aria-label="Choose slide">
            {slides.map((_, index) => (
              <button
                key={index}
                role="tab"
                aria-selected={index === currentSlide}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide ? 'true' : undefined}
                className={cn(
                  "h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primary",
                  index === currentSlide ? "w-8 bg-primary" : "w-2 bg-background/60"
                )}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
