import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Clock, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact = () => {
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await api.post("/contact", data);
      form.reset();
      toast({ title: "Message sent", description: "We'll get back to you soon." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send message.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-10 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          We'd love to hear from you. Reach out with any questions, feedback, or concerns.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mb-12">
          <div className="bg-secondary/40 rounded-xl p-6 text-center space-y-2">
            <Mail className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold">Email</h3>
            <p className="text-sm text-muted-foreground">support@menswear.com</p>
          </div>
          <div className="bg-secondary/40 rounded-xl p-6 text-center space-y-2">
            <Phone className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold">Phone</h3>
            <p className="text-sm text-muted-foreground">+91 1800-123-4567</p>
          </div>
          <div className="bg-secondary/40 rounded-xl p-6 text-center space-y-2">
            <Clock className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-semibold">Hours</h3>
            <p className="text-sm text-muted-foreground">Mon - Sat: 9AM - 9PM IST</p>
          </div>
        </div>

        <div className="max-w-xl">
          <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Your message..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send message"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
