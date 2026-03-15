import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const About = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">About Us</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>MENSWEAR is a premium fashion brand dedicated to bringing you high-quality, stylish clothing at affordable prices. We believe that every man deserves to look and feel his best.</p>
        <p>Founded with a passion for quality craftsmanship, we source the finest fabrics and work with skilled artisans to create pieces that are both comfortable and fashionable.</p>
        <p>Our mission is to make premium menswear accessible to everyone, without compromising on quality or style.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
