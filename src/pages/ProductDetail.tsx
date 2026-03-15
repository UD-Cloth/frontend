import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductInfo } from "@/components/products/ProductInfo";
import { useProductById, useProductsByCategory } from "@/hooks/useProducts";
import { ProductReviews } from "@/components/products/ProductReviews";
import { Loader2, Home } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading: isProductLoading } = useProductById(id);
  const { data: relatedProductsData = [], isLoading: isRelatedLoading } = useProductsByCategory(
    typeof product?.category === "string" ? product.category : product?.category?._id
  );

  if (isProductLoading || isRelatedLoading) {
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

  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name;

  // Bug #124: Dynamic page title
  useEffect(() => {
    document.title = `${product.name} — URBAN DRAPE`;
    return () => { document.title = 'URBAN DRAPE - Premium Men\'s Fashion'; };
  }, [product.name]);
  
  const relatedProducts = relatedProductsData.filter(
    (p) => (p._id || p.id) !== (product._id || product.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="w-full bg-secondary/40">
          <div className="container px-4 md:px-8 py-3">
            <nav className="text-xs md:text-sm text-muted-foreground font-medium">
              <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1"><Home className="h-3 w-3" />Home</Link>
              <span className="mx-2 text-border">/</span>
              <Link to={`/category/${categoryName}`} className="hover:text-primary transition-colors">
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
                  images={product.images && product.images.length > 0 ? product.images : [product.image]}
                  name={product.name}
                  isNew={product.isNewItem || product.isNew}
                />
              </div>

              {/* Product Info */}
              <ProductInfo product={product} />
            </div>
          </div>
        </section>

        {/* Bug #70/#71: Product Reviews section */}
        <ProductReviews productId={product._id || product.id || ""} />

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
