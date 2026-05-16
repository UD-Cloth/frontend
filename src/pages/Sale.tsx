import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useSaleProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";

const Sale = () => {
  // Sprint 5 / BUG-F-030 + BUG-F-049: real API + real loading state.
  const { data: products = [], isLoading, error } = useSaleProducts();

  // Bug #67: sort sale products by discount percent (desc) by default
  const sortedProducts = [...products].sort((a: any, b: any) => {
    const pctA = a.price && a.discountPrice ? ((a.price - a.discountPrice) / a.price) * 100 : 0;
    const pctB = b.price && b.discountPrice ? ((b.price - b.discountPrice) / b.price) * 100 : 0;
    return pctB - pctA;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Sale" description="Sale picks at Urban Drape — limited-time prices." />
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Sale</h1>
            <p className="text-muted-foreground mt-2">
              Don't miss out on these amazing deals!
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
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No sale items available at the moment.
              </p>
              <p className="text-muted-foreground mt-2">
                Check back soon for amazing deals!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {sortedProducts.map((product: any) => (
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

export default Sale;
