import { Truck, RotateCcw, CreditCard, Shield } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹999",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "15-day return policy",
  },
  {
    icon: CreditCard,
    title: "COD Available",
    description: "Pay on delivery",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "100% secure checkout",
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-6 md:py-8 bg-muted border-y">
      <div className="container px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3 p-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <badge.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm">{badge.title}</h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
