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
import SEO from "@/components/SEO";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading: isProductLoading } = useProductById(id);
  const { data: relatedProductsData = [], isLoading: isRelatedLoading } = useProductsByCategory(
    typeof product?.category === "string" ? product.category : product?.category?._id
  );

  // Bug #56: don't block whole page on related-products fetch — show skeleton
  // inside the "You May Also Like" carousel instead.
  if (isProductLoading) {
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

  const relatedProducts = relatedProductsData.filter(
    (p) => (p._id || p.id) !== (product._id || product.id)
  );

  // Sprint 2 + Sprint 6 / BUG-F-084 + Sprint 7 / BUG-F-095: JSON-LD Product
  // schema for rich Google result eligibility, with no `as any` casts.
  const stockValue = product.stock ?? product.countInStock;
  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    priceCurrency: 'INR',
    price: product.price,
  };
  if (typeof stockValue === 'number') {
    offer.availability = stockValue > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';
  }
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images?.length ? product.images : (product.image ? [product.image] : []),
    description: product.description || `${product.name} — Urban Drape`,
    sku: product.sku || product._id || product.id,
    brand: { '@type': 'Brand', name: product.brand || 'Urban Drape' },
    offers: offer,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={product.name}
        description={product.description?.slice(0, 160) || `Buy ${product.name} from Urban Drape.`}
        image={product.images?.[0] || product.image}
        ogType="product"
        jsonLd={jsonLd}
      />
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
                  isNew={product.isNewItem || product.isNew || product.isNewArrival}
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
        {/* Bug #56: render skeleton cards while related-products fetch is in flight */}
        {(isRelatedLoading || relatedProducts.length > 0) && (
          <section className="border-t bg-secondary/20">
            <ProductCarousel
              title="You May Also Like"
              products={relatedProducts}
              isLoading={isRelatedLoading}
            />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
