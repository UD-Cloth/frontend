import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrendingProducts } from "@/hooks/useProducts";
import SEO from "@/components/SEO";

const Trending = () => {
  // Sprint 5 / BUG-F-030: real API instead of demo store.
  const { data: trendingProducts = [], isLoading, error } = useTrendingProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Trending now" description="What everyone's loving at Urban Drape this week." />
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Trending Now</h1>
            <p className="text-muted-foreground mt-2">
              Discover what's hot this season
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Could not load products. Please try again.</p>
            </div>
          ) : trendingProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No trending products available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {trendingProducts.map((product: any) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Trending;
