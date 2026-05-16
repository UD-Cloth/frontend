import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { SlidersHorizontal, X, Grid, List, Home } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductCard } from "@/components/products/ProductCard";
import { useProductsByCategory, useCategories } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatPrice } from "@/lib/utils";
import SEO from "@/components/SEO";

const defaultSizes = ["S", "M", "L", "XL", "XXL"];
const defaultColors = ["Black", "White", "Navy", "Grey", "Maroon"];
const colorMap: Record<string, string> = {
  Black: "bg-black",
  White: "bg-white border-border border",
  Navy: "bg-blue-900",
  Grey: "bg-gray-500",
  Maroon: "bg-red-800",
  Blue: "bg-blue-700",
  Red: "bg-red-600",
  Green: "bg-green-700",
  Brown: "bg-yellow-900",
  Pink: "bg-pink-300",
};
const defaultPriceRanges = [
  { label: "Under ₹1000", min: 0, max: 1000 },
  { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { label: "₹2000 - ₹3000", min: 2000, max: 3000 },
  { label: "Above ₹3000", min: 3000, max: Infinity },
];

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: categoryProducts = [], isLoading: isProductsLoading } = useProductsByCategory(categoryId);
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  const category = categories.find((c) => c.name === categoryId || c._id === categoryId);

  // Bug #108/#109/#110: Derive available sizes, colors, and prices from actual product inventory
  const availableFilters = useMemo(() => {
    const uniqueSizes = new Set<string>();
    const uniqueColors = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    categoryProducts.forEach((p: any) => {
      if (p.sizes && Array.isArray(p.sizes)) {
        p.sizes.forEach((s: string) => uniqueSizes.add(s));
      }
      if (p.colors) {
        if (Array.isArray(p.colors)) {
          p.colors.forEach((c: any) => {
            const colorName = typeof c === 'string' ? c : c.name;
            if (colorName) uniqueColors.add(colorName);
          });
        }
      }
      if (p.price) {
        minPrice = Math.min(minPrice, p.price);
        maxPrice = Math.max(maxPrice, p.price);
      }
    });

    const sizes = Array.from(uniqueSizes).length > 0
      ? Array.from(uniqueSizes).sort()
      : defaultSizes;
    const colors = Array.from(uniqueColors).length > 0
      ? Array.from(uniqueColors).sort()
      : defaultColors;

    return { sizes, colors, minPrice, maxPrice };
  }, [categoryProducts]);

  if (isProductsLoading || isCategoriesLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container px-4 py-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Bug #106: Show 404-style message if category slug is not found
  if (!isCategoriesLoading && categories.length > 0 && !category && categoryProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
          <h1 className="text-3xl font-bold mb-2">Category Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            We couldn't find a category matching "{categoryId}". Browse our available categories below.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {categories.map((c) => (
              <Link key={c._id} to={`/category/${c.name}`}>
                <Button variant="outline">{c.name}</Button>
              </Link>
            ))}
          </div>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Apply filters
  let filteredProducts = [...categoryProducts];

  if (selectedSizes.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      p.sizes.some((s) => selectedSizes.includes(s))
    );
  }

  if (selectedColors.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      p.colors.some((c: any) => selectedColors.includes(typeof c === 'string' ? c : c.name))
    );
  }

  if (selectedPriceRange !== null) {
    const range = defaultPriceRanges[selectedPriceRange];
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
      {/* Bug #60: sticky Clear-all visible at top of filter sidebar when active */}
      {hasActiveFilters && (
        <div className="sticky top-0 z-10 bg-background pb-3 -mx-1 px-1 border-b">
          <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 mr-1.5" />
            Clear all filters
          </Button>
        </div>
      )}
      {/* Size Filter */}
      <div>
        <h4 className="font-medium mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {availableFilters.sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "w-10 h-10 rounded-full border text-sm font-medium transition-all flex items-center justify-center hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                selectedSizes.includes(size)
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                  : "bg-background text-foreground border-border hover:border-primary"
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
        <div className="flex flex-wrap gap-2">
          {availableFilters.colors.map((color) => (
            <button
              key={color}
              title={color}
              onClick={() => toggleColor(color)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all ring-offset-background",
                colorMap[color] || "bg-gray-300",
                selectedColors.includes(color)
                  ? "ring-2 ring-primary ring-offset-2 scale-110 border-transparent"
                  : "border-transparent hover:scale-105"
              )}
            />
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="space-y-2">
          {defaultPriceRanges.map((range, index) => (
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
      <SEO
        title={category?.name ? `${category.name}` : 'Category'}
        description={
          category?.name
            ? `Shop ${category.name} from Urban Drape — modern Indian apparel.`
            : 'Browse Urban Drape categories.'
        }
      />
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
                  <Link to="/" className="hover:underline inline-flex items-center gap-1"><Home className="h-3 w-3" />Home</Link>
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
                  <div className="mt-6 pb-20">
                    <FilterContent />
                  </div>
                  {/* Bug #208: Add close button at bottom for mobile */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <SheetClose asChild>
                      <Button variant="default" className="w-full">Close Filters</Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} products
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
                  {defaultPriceRanges[selectedPriceRange].label}
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
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-4">
                    No products found matching your filters.
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                viewMode === "grid" ? (
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product._id || product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  // Bug #107: List view uses proper horizontal card layout
                  <div className="flex flex-col gap-4">
                    {filteredProducts.map((product) => {
                      const pid = product._id || product.id;
                      const displayPrice = product.discountPrice || product.price;
                      const originalPrice = product.discountPrice ? product.price : product.originalPrice;
                      return (
                        <Link key={pid} to={`/product/${pid}`} className="flex gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow bg-background">
                          <img
                            src={product.images?.[0] || product.image || ""}
                            alt={product.name}
                            loading="lazy"
                            className="w-24 h-32 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              {product.brand && (
                                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{product.brand}</p>
                              )}
                              <h3 className="font-semibold text-sm md:text-base line-clamp-2">{product.name}</h3>
                              <p className="text-muted-foreground text-xs md:text-sm mt-1 line-clamp-2">{product.description}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-bold text-primary">
                                {formatPrice(displayPrice)}
                              </span>
                              {originalPrice && originalPrice > displayPrice && (
                                <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )
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
