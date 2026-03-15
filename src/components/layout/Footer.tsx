import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useProducts";

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const { data: categories = [] } = useCategories();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setNewsletterSubmitted(true);
    setNewsletterEmail("");
    // Bug #66: Newsletter has real feedback
    toast.success("Subscribed!", { description: "You'll receive updates on new arrivals and offers." });
  };

  // Bug #212: Copyright uses current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter */}
      <div className="border-b border-background/10">
        <div className="container px-4 py-6 md:py-8">
          <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold">Subscribe to our Newsletter</h3>
              <p className="text-sm text-background/70">
                Get updates on new arrivals, offers and more!
              </p>
            </div>
            {/* Bug #66: Newsletter has logic and feedback */}
            {newsletterSubmitted ? (
              <p className="text-sm font-medium text-primary bg-primary/20 px-4 py-2 rounded-lg border border-primary/30">
                ✓ Thank you for subscribing!
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full md:w-64 bg-background/10 border-background/20 text-background placeholder:text-background/50"
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-background/70">
              {/* Bug #48: Use dynamic categories from database */}
              {categories.length > 0 ? (
                categories.map((cat: any) => (
                  <li key={cat._id}>
                    <Link to={`/category/${cat.name}`} className="hover:text-background transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback to hardcoded if categories fail to load
                <>
                  <li>
                    <Link to="/category/tshirts" className="hover:text-background transition-colors">
                      T-Shirts
                    </Link>
                  </li>
                  <li>
                    <Link to="/category/shirts" className="hover:text-background transition-colors">
                      Shirts
                    </Link>
                  </li>
                  <li>
                    <Link to="/category/hoodies" className="hover:text-background transition-colors">
                      Hoodies
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link to="/contact" className="hover:text-background transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-background transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-background transition-colors">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="hover:text-background transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-background transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link to="/about" className="hover:text-background transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-background transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-background transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-background transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-background transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact - Bug #50: Fixed email to urbandrape domain, Bug #237: clickable mailto/tel */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                {/* Bug #50: Branding-correct email domain */}
                <a href="mailto:support@urbandrape.com" className="hover:text-background transition-colors">
                  support@urbandrape.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                {/* Bug #237: tel: link for phone */}
                <a href="tel:+911800123456" className="hover:text-background transition-colors">
                  +91 1800-123-4567
                </a>
              </li>
              <li>Mon – Sat: 9AM – 9PM IST</li>
            </ul>
            {/* Bug #270: Social links open in new tab */}
            <div className="flex gap-4 mt-4">
              <a href="https://www.facebook.com/share/1Daw6Fo4yU/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/ud_urbandrape/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://x.com/UrbanDrape" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="X (Twitter)">
                <Twitter className="h-5 w-5" />
              </a>
              {/* Bug #169: YouTube link was visible but href was missing */}
              <a href="https://www.youtube.com/@urbandrape" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/70">
            {/* Bug #212: Dynamic copyright year */}
            <p className="text-center md:text-left">© {currentYear} URBAN DRAPE. All rights reserved.</p>
            <div className="flex gap-4">
              <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-6 w-auto" />
              <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="Mastercard" className="h-6 w-auto" />
              <img src="https://cdn-icons-png.flaticon.com/512/5968/5968268.png" alt="UPI" className="h-6 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
