import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, SearchX, Search } from "lucide-react";
import SEO from "@/components/SEO";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  // Bug #96: Reflect the current query back in the search input
  const [inputValue, setInputValue] = useState(query);

  // Bug #88: skip API call for empty / very short queries. The useProducts hook
  // already bails when `q` is empty, so pass an empty string for sub-2-char input.
  const trimmedQuery = query.trim();
  const skipQuery = trimmedQuery.length < 2;
  const { data: products = [], isLoading: queryLoading } = useProducts({
    q: skipQuery ? "" : trimmedQuery,
  });

  const isLoading = !skipQuery && queryLoading;
  const totalResults = skipQuery ? 0 : products.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Search" description="Search Urban Drape products." />
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
        ) : skipQuery ? (
          // Bug #53: clear empty state when q is empty / too short
          <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Start your search</h2>
            <p className="text-muted-foreground mb-4">
              Type at least 2 characters above to find products.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button variant="outline" onClick={() => navigate("/new-arrivals")}>New Arrivals</Button>
              <Button variant="outline" onClick={() => navigate("/sale")}>Sale</Button>
              <Button variant="outline" onClick={() => navigate("/trending")}>Trending</Button>
            </div>
          </div>
        ) : totalResults === 0 ? (
          // Bug #93: center-align "0 results" message
          <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
            <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">0 results found</h2>
            <p className="text-muted-foreground mb-4">
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
