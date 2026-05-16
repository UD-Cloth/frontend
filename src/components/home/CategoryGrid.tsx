import { Link } from "react-router-dom";
import { categories } from "@/data/products";

export const CategoryGrid = () => {
  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group relative overflow-hidden rounded-lg aspect-[3/4]"
            >
              {/* Sprint 6 / BUG-F-046: lazy + decoding async to avoid blocking
                  first paint with 6 large category thumbs. */}
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
              <div className="absolute inset-0 flex items-end justify-center pb-2 sm:pb-4">
                <span className="text-background font-semibold text-xs sm:text-sm md:text-lg group-hover:text-primary transition-colors text-center px-1">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
