import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Truck, Clock, MapPin } from "lucide-react";

const Shipping = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Shipping Information</h1>
      <div className="space-y-6 text-muted-foreground">
        <div className="flex gap-4 items-start"><Truck className="h-6 w-6 text-primary mt-1 flex-shrink-0" /><div><h3 className="font-semibold text-foreground mb-1">Free Shipping</h3><p className="text-sm">Free delivery on all orders above ₹999. Standard shipping charges of ₹99 apply for orders below ₹999.</p></div></div>
        <div className="flex gap-4 items-start"><Clock className="h-6 w-6 text-primary mt-1 flex-shrink-0" /><div><h3 className="font-semibold text-foreground mb-1">Delivery Time</h3><p className="text-sm">Orders are delivered within 5-7 business days. Metro cities may receive orders within 3-5 business days.</p></div></div>
        <div className="flex gap-4 items-start"><MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" /><div><h3 className="font-semibold text-foreground mb-1">Pan India Delivery</h3><p className="text-sm">We deliver across India to over 25,000+ pin codes. Cash on Delivery (COD) is available on select pin codes.</p></div></div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Shipping;
