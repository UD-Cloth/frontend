import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1">
      <div className="bg-foreground text-background py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Urban Drape</h1>
        <p className="text-background/70 text-lg max-w-2xl mx-auto">
          Premium menswear crafted for the modern Indian man — where style meets substance.
        </p>
      </div>

      <div className="container px-4 md:px-8 py-12 md:py-16 max-w-4xl mx-auto">
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Urban Drape was born out of a simple frustration: finding premium-quality menswear in India that didn't cost a fortune. Our founders — a group of fashion enthusiasts and technology entrepreneurs from Mumbai — believed that every man deserves to dress well without compromise.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            What started as a small curated collection of T-shirts and shirts has grown into a full menswear brand offering everything from everyday essentials to statement pieces. We work directly with skilled artisans and fabric mills across India to ensure each garment meets our exacting standards.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, Urban Drape serves customers across India with a commitment to quality, sustainability, and genuine style. We're not just selling clothes — we're building a community of men who value thoughtful dressing.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Our Values</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-secondary/40 rounded-xl p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Quality First</h3>
              <p className="text-sm text-muted-foreground">
                We source only the finest fabrics and use precise manufacturing techniques. Every stitch is inspected before it reaches you.
              </p>
            </div>
            <div className="bg-secondary/40 rounded-xl p-6">
              <div className="text-3xl mb-3">🌿</div>
              <h3 className="font-semibold mb-2">Responsible Fashion</h3>
              <p className="text-sm text-muted-foreground">
                We're committed to reducing our environmental footprint — from eco-friendly packaging to responsible dye processes in our supply chain.
              </p>
            </div>
            <div className="bg-secondary/40 rounded-xl p-6">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-semibold mb-2">Customer Centricity</h3>
              <p className="text-sm text-muted-foreground">
                Our customers are at the heart of everything. From easy returns to 24/7 support, we make shopping stress-free.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Choose Urban Drape?</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span><strong className="text-foreground">Direct-to-consumer pricing</strong> — No middlemen. Premium quality at fair prices.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span><strong className="text-foreground">Free shipping above ₹2,000</strong> — Delivered across India in 3–7 business days.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span><strong className="text-foreground">Easy 30-day returns</strong> — Not happy? Return it, no questions asked.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span><strong className="text-foreground">Size-inclusive range</strong> — From S to 3XL, we cater to every body type.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span><strong className="text-foreground">Dedicated support</strong> — Reach us via email, phone, or chat — Mon to Sat, 9AM–9PM IST.</span>
            </li>
          </ul>
        </section>

        <section className="text-center bg-secondary/40 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-3">Ready to Upgrade Your Wardrobe?</h2>
          <p className="text-muted-foreground mb-6">Explore our latest collections — from everyday essentials to statement pieces.</p>
          <Button asChild size="lg">
            <Link to="/">Shop Now</Link>
          </Button>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
