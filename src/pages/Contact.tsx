import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import api from "@/lib/api";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Bug #68: inline confirmation message (in addition to toast) so users get
  // a persistent visual confirmation that their message was sent.
  const [submitted, setSubmitted] = useState(false);

  // Sprint 4 / BUG-F-088: post to our own /api/contact endpoint instead of
  // the public formsubmit.co relay. Sprint 2 added a per-IP rate limit on the
  // backend route — bypassing it via formsubmit.co left contact submissions
  // unrate-limited and invisible to admins.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = `${formData.get('first-name') ?? ''} ${formData.get('last-name') ?? ''}`.trim();
    const email = String(formData.get('email') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    if (!name || !email || !message) {
      toast.error("Please fill in your name, email, and a message.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/contact', { name, email, subject, message });
      // Bug #68: longer toast duration + inline confirmation
      toast.success("Message sent successfully! We'll get back to you soon.", {
        duration: 8000,
      });
      setSubmitted(true);
      form.reset();
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 429) {
        toast.error("You've sent too many messages recently. Please try again later.");
      } else {
        toast.error(error?.response?.data?.message || "Failed to send message. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Contact us" description="Reach the Urban Drape team — questions, support, partnerships." />
      <Header />
      
      {/* Hero Section */}
      <div className="bg-muted py-12 md:py-20 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Get in Touch</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
          Whether you have a question about our collections, your order, or anything else, our team is ready to answer all your questions.
        </p>
      </div>

      <main className="flex-1 container px-4 md:px-8 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
            
            <div className="flex items-start gap-4 p-6 bg-secondary/30 rounded-2xl border border-border/50">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Email Us</h3>
                <p className="text-muted-foreground mt-1 text-sm">Our friendly team is here to help.</p>
                <a href="mailto:urbandrape25@gmail.com" className="text-primary font-medium mt-2 inline-block hover:underline">urbandrape25@gmail.com</a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-secondary/30 rounded-2xl border border-border/50">
              <div className="bg-primary/10 p-3 rounded-full">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Call Us</h3>
                <p className="text-muted-foreground mt-1 text-sm">Mon-Sat from 9am to 9pm IST.</p>
                <a href="tel:+9118001234567" className="text-primary font-medium mt-2 inline-block hover:underline">+91 1800-123-4567</a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-secondary/30 rounded-2xl border border-border/50">
              <div className="bg-primary/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Visit Us</h3>
                <p className="text-muted-foreground mt-1 text-sm">Visit our flagship store in New Delhi.</p>
                <p className="font-medium mt-2 text-sm text-foreground">123 Fashion Avenue, ND 110001</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card shadow-sm border rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
            {/* Bug #68: inline confirmation message */}
            {submitted && (
              <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Thanks! Your message has been sent. We'll get back to you within 1-2 business days.
              </div>
            )}
            <form onSubmit={(e) => { setSubmitted(false); handleSubmit(e); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first-name" className="text-sm font-medium">First Name</label>
                  <Input id="first-name" name="first-name" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last-name" className="text-sm font-medium">Last Name</label>
                  <Input id="last-name" name="last-name" placeholder="Doe" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input id="subject" name="subject" placeholder="How can we help?" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea 
                  id="message" 
                  name="message"
                  placeholder="Tell us more about your inquiry..." 
                  className="min-h-[120px] resize-y" 
                  required 
                />
              </div>

              <Button type="submit" className="w-full mt-2" size="lg" disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
