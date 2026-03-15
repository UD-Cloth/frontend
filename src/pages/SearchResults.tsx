import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, SearchX, Search } from "lucide-react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  // Bug #96: Reflect the current query back in the search input
  const [inputValue, setInputValue] = useState(query);

  const { data: products = [], isLoading } = useProducts({ q: query });

  const totalResults = products.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container px-4 py-8">
        {/* Bug #96: Search input with current query reflected */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mb-6">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search products..."
              className="flex-1"
            />
            <Button type="submit" aria-label="Search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          <h1 className="text-2xl font-bold mb-1">
            {query ? `Results for "${query}"` : "All Products"}
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? "Searching..." : `${totalResults} ${totalResults === 1 ? "product" : "products"} found`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground max-w-md mb-4">
              We couldn't find any products matching "{query}". Try a different keyword or browse our categories.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button variant="outline" onClick={() => navigate("/new-arrivals")}>New Arrivals</Button>
              <Button variant="outline" onClick={() => navigate("/sale")}>Sale</Button>
              <Button variant="outline" onClick={() => navigate("/trending")}>Trending</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
