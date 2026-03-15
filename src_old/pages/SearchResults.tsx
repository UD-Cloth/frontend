import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { useSearchProducts } from "@/hooks/useProducts";
import { Loader2, SearchX } from "lucide-react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: filteredProducts = [], isLoading } = useSearchProducts(query);

  const totalResults = filteredProducts.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-muted-foreground">
            {totalResults} {totalResults === 1 ? "product" : "products"} found
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-3">No products found</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              We couldn't find any products matching "{query}". Try searching with different keywords or browse our popular categories below.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/category/men" className="text-sm border px-6 py-2.5 rounded-full hover:border-primary hover:bg-secondary/50 transition-colors">Men's Fit</Link>
              <Link to="/category/women" className="text-sm border px-6 py-2.5 rounded-full hover:border-primary hover:bg-secondary/50 transition-colors">Women's Wear</Link>
              <Link to="/sale" className="text-sm border px-6 py-2.5 rounded-full hover:border-primary hover:bg-secondary/50 text-red-600 transition-colors font-medium">Clearance Sale</Link>
              <Link to="/new-arrivals" className="text-sm border px-6 py-2.5 rounded-full hover:border-primary hover:bg-secondary/50 transition-colors">New Arrivals</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product as any} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
