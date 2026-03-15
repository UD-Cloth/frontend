import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Privacy = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: January 2025</p>
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>Urban Drape ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website and services.</p>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">1. Information We Collect</h3>
          <p className="mb-2">We collect information you provide directly when you:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Create an account (name, email address, password)</li>
            <li>Place an order (shipping address, phone number, payment method)</li>
            <li>Contact our support team (messages, attachments)</li>
            <li>Subscribe to our newsletter (email address)</li>
          </ul>
          <p className="mt-2">We also automatically collect device and usage information (IP address, browser type, pages visited, time spent) through cookies and similar tracking technologies.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">2. How We Use Your Information</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>Process and fulfill your orders and returns</li>
            <li>Send order confirmations, shipping updates, and support replies</li>
            <li>Personalize your shopping experience and product recommendations</li>
            <li>Send promotional emails and newsletters (you can unsubscribe anytime)</li>
            <li>Improve our website, products, and services</li>
            <li>Comply with legal obligations and prevent fraud</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">3. Data Sharing</h3>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc ml-5 space-y-1 mt-2">
            <li><strong className="text-foreground">Delivery partners</strong> (name, address, phone) to fulfill orders</li>
            <li><strong className="text-foreground">Payment processors</strong> to handle transactions securely</li>
            <li><strong className="text-foreground">Analytics services</strong> (anonymized, aggregated data only)</li>
            <li><strong className="text-foreground">Legal authorities</strong> when required by law</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">4. Data Security</h3>
          <p>We implement industry-standard security measures including SSL encryption, secure password hashing, and regular security audits to protect your personal information from unauthorized access, alteration, or disclosure.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">5. Cookies</h3>
          <p>We use cookies to maintain your session, remember your preferences, and analyze site traffic. You can control cookies through your browser settings, though disabling them may affect site functionality.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">6. Your Rights</h3>
          <p>You have the right to access, correct, or delete your personal data. You can update your profile information in your account settings or contact us at <a href="mailto:support@urbandrape.com" className="text-primary hover:underline">support@urbandrape.com</a> to request deletion.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">7. Data Retention</h3>
          <p>We retain your personal data for as long as your account is active or as needed to provide services. Order data may be kept for up to 7 years for legal and tax compliance purposes.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">8. Contact Us</h3>
          <p>For privacy-related queries, contact our Data Protection Officer at: <a href="mailto:support@urbandrape.com" className="text-primary hover:underline">support@urbandrape.com</a></p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
