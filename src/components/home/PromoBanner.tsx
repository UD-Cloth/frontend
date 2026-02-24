import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const PromoBanner = () => {
  return (
    <section className="py-8 md:py-12 bg-primary text-primary-foreground">
      <div className="container px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 md:mb-2">
              Trending This Season
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-primary-foreground/90">
              Explore our curated collection of premium men's fashion
            </p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="bg-background text-foreground hover:bg-background/90 w-full sm:w-auto"
            asChild
          >
            <Link to="/trending">Shop Trending</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
