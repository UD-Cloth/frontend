import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCmsStore } from "@/stores/cmsStore";

export const PromoBanner = () => {
  const promo = useCmsStore(state => state.promoBanner);

  if (!promo.isActive) return null;

  const titleText = promo.text.split('-')[0] || promo.text;
  const subtitleText = promo.text.split('-')[1] || '';

  return (
    <section
      className="py-10 md:py-16 relative overflow-hidden"
      style={{ backgroundColor: promo.bgColor, color: promo.textColor }}
    >
      {/* Premium Texture & Gradient Overlays */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent mix-blend-overlay pointer-events-none" />
      
      <div className="container px-4 relative z-10">
        <div className="flex flex-col items-center justify-between gap-4 md:gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 md:mb-2">
              {titleText.trim()}
            </h2>
            {subtitleText && (
              <p className="text-sm sm:text-base md:text-lg opacity-90">
                {subtitleText.trim()}
              </p>
            )}
          </div>
          {promo.link && (
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto hover:opacity-90 transition-opacity"
              style={{ backgroundColor: promo.textColor, color: promo.bgColor }}
              asChild
            >
              <Link to={promo.link}>Shop Now</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
