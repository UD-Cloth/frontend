import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Careers = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Careers</h1>
      <p className="text-muted-foreground mb-4">Join our growing team! We're always looking for talented, passionate people.</p>
      <p className="text-sm text-muted-foreground">No open positions at the moment. Check back soon or email us at <span className="text-primary font-medium">careers@menswear.com</span>.</p>
    </main>
    <Footer />
  </div>
);

export default Careers;
