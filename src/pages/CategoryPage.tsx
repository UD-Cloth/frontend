import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SlidersHorizontal, ChevronDown, X, Grid, List } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductCard } from "@/components/products/ProductCard";
import { useCategories, useProductsByCategory, useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const sizes = ["S", "M", "L", "XL", "XXL"];
const colors = ["Black", "White", "Navy", "Grey", "Maroon"];
const priceRanges = [
  { label: "Under ₹1000", min: 0, max: 1000 },
  { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { label: "₹2000 - ₹3000", min: 2000, max: 3000 },
  { label: "Above ₹3000", min: 3000, max: Infinity },
];

const CategoryPage = () => {
  const { categoryId: rawCategoryId } = useParams<{ categoryId: string }>();
  const categoryId = rawCategoryId ? decodeURIComponent(rawCategoryId) : undefined;
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: categories = [] } = useCategories();
  const category = categoryId ? categories.find((c) => c.name === categoryId) : undefined;
  const { data: catProds = [], isLoading: catIsLoading } = useProductsByCategory(categoryId);
  const { data: allProds = [], isLoading: allIsLoading } = useProducts();

  const categoryProducts = categoryId ? catProds : allProds;
  const isLoading = categoryId ? catIsLoading : allIsLoading;

  // Apply filters
  let filteredProducts = [...categoryProducts];

  if (selectedSizes.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      p.sizes.some((s) => selectedSizes.includes(s))
    );
  }

  if (selectedColors.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      p.colors.some((c) => selectedColors.includes(c.name))
    );
  }

  if (selectedPriceRange !== null) {
    const range = priceRanges[selectedPriceRange];
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= range.min && p.price <= range.max
    );
  }

  // Apply sorting
  switch (sortBy) {
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      // newest - keep original order
      break;
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedPriceRange(null);
  };

  const hasActiveFilters =
    selectedSizes.length > 0 || selectedColors.length > 0 || selectedPriceRange !== null;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Size Filter */}
      <div>
        <h4 className="font-medium mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "px-3 py-1.5 rounded border text-sm transition-colors",
                selectedSizes.includes(size)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h4 className="font-medium mb-3">Color</h4>
        <div className="space-y-2">
          {colors.map((color) => (
            <label key={color} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedColors.includes(color)}
                onCheckedChange={() => toggleColor(color)}
              />
              <span className="text-sm">{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <label key={index} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedPriceRange === index}
                onCheckedChange={() =>
                  setSelectedPriceRange(selectedPriceRange === index ? null : index)
                }
              />
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        {category && (
          <div className="relative h-48 md:h-64 bg-muted overflow-hidden">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-foreground/60 to-foreground/40">
              <div className="text-center text-background">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">{category.name}</h1>
                <nav className="text-sm">
                  <Link to="/" className="hover:underline">Home</Link>
                  <span className="mx-2">/</span>
                  <span>{category.name}</span>
                </nav>
              </div>
            </div>
          </div>
        )}

        <div className="container px-4 py-8">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {selectedSizes.length + selectedColors.length + (selectedPriceRange !== null ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${filteredProducts.length} products`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="hidden md:flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedSizes.map((size) => (
                <Button
                  key={size}
                  variant="secondary"
                  size="sm"
                  className="h-7"
                  onClick={() => toggleSize(size)}
                >
                  Size: {size}
                  <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              {selectedColors.map((color) => (
                <Button
                  key={color}
                  variant="secondary"
                  size="sm"
                  className="h-7"
                  onClick={() => toggleColor(color)}
                >
                  {color}
                  <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
              {selectedPriceRange !== null && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7"
                  onClick={() => setSelectedPriceRange(null)}
                >
                  {priceRanges[selectedPriceRange].label}
                  <X className="h-3 w-3 ml-1" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-primary"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h3 className="font-semibold text-lg mb-4">Filters</h3>
                <FilterContent />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-4">
                    No products found matching your filters.
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "grid gap-4",
                    viewMode === "grid"
                      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                      : "grid-cols-1"
                  )}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
