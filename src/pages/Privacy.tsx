import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Privacy = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>
        <h3 className="font-semibold text-foreground text-base">Information We Collect</h3>
        <p>We collect information you provide when creating an account, placing an order, or contacting us — including name, email, phone number, and shipping address.</p>
        <h3 className="font-semibold text-foreground text-base">How We Use Your Information</h3>
        <p>We use your information to process orders, improve our services, and communicate with you about promotions and updates.</p>
        <h3 className="font-semibold text-foreground text-base">Data Security</h3>
        <p>We implement industry-standard security measures to protect your personal information from unauthorized access.</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
