import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductInfo } from "@/components/products/ProductInfo";
import { ProductReviews } from "@/components/products/ProductReviews";
import { useProductById, useProductsByCategory } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProductById(id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const categoryName = product ? (typeof product.category === "object" ? (product.category as { name?: string })?.name : product.category) : undefined;
  const { data: categoryProducts = [] } = useProductsByCategory(categoryName ?? undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button asChild>
              <Link to="/">Go Back Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = categoryProducts.filter(
    (p) => (p._id || p.id) !== (product._id || product.id)
  ).slice(0, 12);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="w-full bg-secondary/40">
          <div className="container px-4 md:px-8 py-3">
            <nav className="text-xs md:text-sm text-muted-foreground font-medium">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="mx-2 text-border">/</span>
              <Link to={`/category/${encodeURIComponent(categoryName ?? "")}`} className="hover:text-primary transition-colors capitalize">
                {categoryName}
              </Link>
              <span className="mx-2 text-border">/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Section - Full Width */}
        <section className="w-full">
          <div className="container px-4 md:px-8 py-6 md:py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20">
              {/* Image Gallery */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <ProductImageGallery
                  images={product.images}
                  name={product.name}
                  isNew={product.isNew ?? (product as { isNewItem?: boolean }).isNewItem}
                  activeImageIndex={activeImageIndex}
                />
              </div>

              {/* Product Info + Reviews */}
              <div className="space-y-8">
                <ProductInfo
                  product={product}
                  onColorChange={(idx) => setActiveImageIndex(idx)}
                />
                <ProductReviews
                  productId={product._id || product.id || ""}
                  isLoggedIn={!!localStorage.getItem("userInfo")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t bg-secondary/20">
            <ProductCarousel title="You May Also Like" products={relatedProducts} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
