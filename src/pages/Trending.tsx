import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { useTrendingProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";

const Trending = () => {
  const { data: trendingProducts = [], isLoading } = useTrendingProducts();

  if (isLoading) {
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
        <div className="container px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Trending Now</h1>
            <p className="text-muted-foreground mt-2">
              Discover what's hot this season
            </p>
          </div>

          {trendingProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No trending products available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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