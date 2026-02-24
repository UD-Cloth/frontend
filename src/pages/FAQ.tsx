import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How do I track my order?", a: "Once your order is shipped, you'll receive a tracking link via email and SMS." },
  { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, UPI, Net Banking, and Cash on Delivery." },
  { q: "Can I cancel my order?", a: "Orders can be cancelled within 24 hours of placing them. Contact our support team for help." },
  { q: "How do returns work?", a: "You can initiate a return within 15 days of delivery. Items must be unused with original tags." },
  { q: "Do you offer international shipping?", a: "Currently, we only ship within India. International shipping is coming soon!" },
];

const FAQ = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="bg-secondary/30 rounded-lg px-4 border-b-0">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline">{faq.q}</AccordionTrigger>
            <AccordionContent><p className="text-sm text-muted-foreground">{faq.a}</p></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
    <Footer />
  </div>
);

export default FAQ;
