import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Terms = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: January 2025</p>
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>Welcome to Urban Drape. By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully.</p>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">1. Eligibility</h3>
          <p>You must be at least 18 years old to use our services or make purchases. By using the site, you represent that you are of legal age and have the authority to enter into this agreement.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">2. Orders & Payments</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes.</li>
            <li>We reserve the right to modify prices without prior notice.</li>
            <li>Orders are confirmed only upon successful payment or COD acceptance.</li>
            <li>We reserve the right to cancel any order due to stock unavailability, pricing errors, or suspected fraud, with a full refund.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">3. Shipping & Delivery</h3>
          <p>We ship across India. Estimated delivery times are 3–7 business days. Urban Drape is not liable for delays caused by courier partners, natural events, or incorrect addresses provided by the customer.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">4. Returns & Refunds</h3>
          <p>We offer a 30-day return policy for unused, unwashed items with original tags. Sale items may have different return conditions. Refunds are processed within 5–7 business days of receiving the returned item. Please visit our <a href="/returns" className="text-primary hover:underline">Returns page</a> for full details.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">5. User Accounts</h3>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use at <a href="mailto:support@urbandrape.com" className="text-primary hover:underline">support@urbandrape.com</a>.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">6. Intellectual Property</h3>
          <p>All content on this website, including images, logos, product descriptions, and designs, is the exclusive property of Urban Drape and may not be reproduced, distributed, or used without prior written permission.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">7. Prohibited Activities</h3>
          <p>You may not use our site to: submit false or fraudulent orders, scrape or harvest data, attempt unauthorized access, or engage in any activity that disrupts our services or other users' experience.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">8. Limitation of Liability</h3>
          <p>Urban Drape shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services or inability to access them. Our maximum liability for any claim shall not exceed the amount paid for the specific order in question.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">9. Governing Law</h3>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground text-base mb-2">10. Contact</h3>
          <p>For any questions about these terms, contact us at <a href="mailto:support@urbandrape.com" className="text-primary hover:underline">support@urbandrape.com</a>.</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
