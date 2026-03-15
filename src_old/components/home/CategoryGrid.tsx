import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useProducts";

export const CategoryGrid = () => {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
          Shop by Category
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 min-h-[200px] items-center justify-center">
            <div className="col-span-full h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          </div>
        ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-lg aspect-[3/4]"
            >
              <img
                src={category.image ?? ""}
                alt={category.name}
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
        )}
      </div>
    </section>
  );
};
