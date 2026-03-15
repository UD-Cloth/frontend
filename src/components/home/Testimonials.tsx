import { Star } from "lucide-react";
import { useCMSData } from "@/hooks/useCMS";

export const Testimonials = () => {
    const { data: cmsData } = useCMSData();
    const testimonials = cmsData?.testimonials || [];

    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="py-12 md:py-20 bg-slate-50">
            <div className="container px-4">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
                    <p className="text-muted-foreground text-lg">
                        Don't just take our word for it. Hear from the people who wear our apparel.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((t) => (
                        <div key={t.id} className="bg-white p-8 rounded-2xl shadow-sm border">
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-slate-700 mb-6 text-lg italic tracking-wide">
                                "{t.content}"
                            </p>
                            <div>
                                <p className="font-bold text-slate-900">{t.name}</p>
                                {t.role && <p className="text-sm text-slate-500 font-medium">{t.role}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
