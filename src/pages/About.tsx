import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";

const About = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <SEO title="About us" description="The Urban Drape story — modern apparel made in India." />
    <Header />
    
    {/* Hero Section */}
    <div className="relative bg-muted py-24 md:py-32 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=2070&auto=format&fit=crop" 
          alt="Premium Menswear" 
          className="w-full h-full object-cover opacity-20 object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="relative z-10 container px-4 text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Redefining Premium Menswear</h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Elevating everyday essentials with uncompromising quality and timeless design.
        </p>
      </div>
    </div>

    <main className="flex-1 container px-4 md:px-8 py-16 md:py-24">
      {/* Brand Story */}
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto mb-20">
        <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl lg:order-2">
          <img 
            src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=987&auto=format&fit=crop" 
            alt="Craftsmanship" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-6 lg:order-1">
          <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>URBAN DRAPE was born from a simple belief: premium menswear shouldn't be complicated or inaccessible. We noticed a gap between fast fashion and luxury designer labels—a space where men wanted exceptionally crafted, timeless pieces without the designer markup.</p>
            <p>Founded by a team of fashion industry veterans, we set out to build a brand that focuses on what truly matters: superior fabrics, perfect fits, and meticulous attention to detail.</p>
            <p>Every piece in our collection is rigorously tested for comfort, durability, and style. We partner with some of the finest mills and ethical factories around the world to bring our vision to life.</p>
          </div>
        </div>
      </div>

      {/* Philosophy Pillars */}
      <div className="max-w-6xl mx-auto bg-secondary/30 rounded-3xl p-8 md:p-12 border border-border/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Philosophy</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">The principles that guide everything we create.</p>
        </div>
        
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Uncompromising Quality</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">We source the finest materials globally, from long-staple cottons to premium wools, ensuring every garment stands the test of time.</p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Timeless Design</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">We ignore fleeting trends in favor of classic silhouettes. Our clothes are designed to look as good today as they will in ten years.</p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Ethical Production</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">We partner exclusively with factories that provide fair wages, safe working conditions, and share our commitment to sustainability.</p>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
