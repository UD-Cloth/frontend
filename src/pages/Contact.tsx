import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
      toast.success("Message Sent!", { description: "We'll get back to you within 24 hours." });
    } catch (err: any) {
      toast.error("Failed to send message", {
        description: err.response?.data?.message || "Please try again or email us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-10 max-w-2xl">We'd love to hear from you. Reach out with any questions, feedback, or concerns and we'll get back to you within 24 hours.</p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-secondary/40 rounded-xl p-6 text-center space-y-2">
            <Mail className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold">Email</h3>
            <a href="mailto:support@urbandrape.com" className="text-sm text-primary hover:underline">
              support@urbandrape.com
            </a>
          </div>
          <div className="bg-secondary/40 rounded-xl p-6 text-center space-y-2">
            <Phone className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold">Phone</h3>
            <a href="tel:+911800123456" className="text-sm text-primary hover:underline">
              +91 1800-123-4567
            </a>
          </div>
          <div className="bg-secondary/40 rounded-xl p-6 text-center space-y-2">
            <Clock className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold">Hours</h3>
            <p className="text-sm text-muted-foreground">Mon – Sat: 9AM – 9PM IST</p>
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-green-50 rounded-xl border border-green-200">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h2>
            <p className="text-green-700 max-w-md">Thank you for reaching out. We'll get back to you within 24 hours.</p>
            <Button className="mt-6" variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 md:p-8 space-y-5 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Send a Message</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Full Name *</Label>
                <Input
                  id="contact-name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors(p => ({ ...p, name: undefined })); }}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email Address *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors(p => ({ ...p, email: undefined })); }}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-subject">Subject</Label>
              <Input
                id="contact-subject"
                placeholder="Order inquiry, return request, feedback..."
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message *</Label>
              <Textarea
                id="contact-message"
                placeholder="Please describe your query in detail..."
                rows={5}
                value={form.message}
                onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors(p => ({ ...p, message: undefined })); }}
              />
              {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Send Message"}
            </Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
