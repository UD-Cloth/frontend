import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Terms = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>By using our website, you agree to the following terms and conditions.</p>
        <h3 className="font-semibold text-foreground text-base">Orders & Payments</h3>
        <p>All prices are listed in INR. We reserve the right to modify prices without prior notice. Orders are confirmed upon successful payment.</p>
        <h3 className="font-semibold text-foreground text-base">Intellectual Property</h3>
        <p>All content on this website, including images, logos, and text, is the property of MENSWEAR and may not be reproduced without permission.</p>
        <h3 className="font-semibold text-foreground text-base">Limitation of Liability</h3>
        <p>MENSWEAR shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
