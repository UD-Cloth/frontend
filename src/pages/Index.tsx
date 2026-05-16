import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { TrustBadges } from "@/components/home/TrustBadges";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { useNewArrivals, useTrendingProducts } from "@/hooks/useProducts";
import SEO from "@/components/SEO";

const Index = () => {
  // Sprint 5 / BUG-F-030: home page now reads from the real API instead of
  // the demo `useProductStore`. The previous wiring meant production users
  // saw empty carousels.
  const { data: newArrivals = [], isLoading: isLoadingNew } = useNewArrivals();
  const { data: trendingProducts = [], isLoading: isLoadingTrending } = useTrendingProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        description="Urban Drape — modern Indian apparel. Shop sarees, kurtas, and contemporary essentials from across India."
      />
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
          isLoading={isLoadingNew}
        />

        {/* Category Grid */}
        <CategoryGrid />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Trending Products */}
        <ProductCarousel
          title="Trending This Season"
          description="Explore our curated collection of premium men's fashion"
          products={trendingProducts}
          viewAllLink="/trending"
          isLoading={isLoadingTrending}
          className="bg-white border-y border-gray-100"
        />

        {/* Testimonials */}
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
