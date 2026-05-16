import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewArrivals } from "@/hooks/useProducts";
import SEO from "@/components/SEO";

const NewArrivals = () => {
  // Sprint 5 / BUG-F-030: real API instead of demo store.
  const { data: newArrivals = [], isLoading, error } = useNewArrivals();

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="New arrivals" description="Just-landed pieces from Urban Drape." />
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">New Arrivals</h1>
            <p className="text-muted-foreground mt-2">
              Discover our latest collection
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
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-lg bg-muted/10">
              <p className="text-muted-foreground text-lg mb-2">
                No new arrivals available yet.
              </p>
              <p className="text-sm text-muted-foreground/80">
                Products marked as "New Arrival" in your Admin Panel will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product: any) => (
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

export default NewArrivals;
