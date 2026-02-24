import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Returns = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Returns & Exchange</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>We want you to love what you ordered! If something doesn't work out, here's how we can help:</p>
        <h3 className="font-semibold text-foreground text-base">Return Policy</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Returns accepted within 15 days of delivery</li>
          <li>Items must be unused, unwashed with original tags attached</li>
          <li>Refunds are processed within 7-10 business days</li>
        </ul>
        <h3 className="font-semibold text-foreground text-base">Exchange Policy</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Exchanges available for a different size or color of the same product</li>
          <li>Subject to availability</li>
          <li>Free pickup for exchange orders</li>
        </ul>
      </div>
    </main>
    <Footer />
  </div>
);

export default Returns;
