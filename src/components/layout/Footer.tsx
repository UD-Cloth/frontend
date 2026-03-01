import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Mail, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export const Footer = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: NewsletterFormValues) => {
    setIsLoading(true);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Newsletter subscription:", values);
    toast({
      title: "Subscribed!",
      description: "Thank you for subscribing to our newsletter.",
    });

    form.reset();
    setIsLoading(false);
  };

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
            <div className="w-full md:w-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row w-full md:w-auto gap-2 items-start">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full md:w-64 space-y-0">
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs mt-1 absolute" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-background/70">
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
              <li>
                <Link to="/category/jackets" className="hover:text-background transition-colors">
                  Jackets
                </Link>
              </li>
              <li>
                <Link to="/category/jeans" className="hover:text-background transition-colors">
                  Jeans
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" className="hover:text-background transition-colors">
                  Accessories
                </Link>
              </li>
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

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>Email: support@menswear.com</li>
              <li>Phone: +91 1800-123-4567</li>
              <li>Mon - Sat: 9AM - 9PM IST</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="https://www.facebook.com/share/1Daw6Fo4yU/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/ud_urbandrape/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://x.com/UrbanDrape" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/70">
            <p>© 2026 URBAN DRAPE. All rights reserved.</p>
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
