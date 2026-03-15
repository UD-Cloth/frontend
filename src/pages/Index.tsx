import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { TrustBadges } from "@/components/home/TrustBadges";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { useNewArrivals, useTrendingProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: newArrivals = [], isLoading: isNewLoading } = useNewArrivals();
  const { data: trendingProducts = [], isLoading: isTrendingLoading } = useTrendingProducts();

  if (isNewLoading || isTrendingLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Trust Badges */}
        <TrustBadges />

        {/* New Arrivals */}
        <ProductCarousel
          title="New Arrivals"
          products={newArrivals}
          viewAllLink="/new-arrivals"
        />

        {/* Category Grid */}
        <CategoryGrid />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Trending Products */}
        <ProductCarousel
          title="Trending Now"
          products={trendingProducts}
          viewAllLink="/trending"
        />

        {/* Testimonials */}
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
