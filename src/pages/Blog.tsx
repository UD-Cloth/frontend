import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Bug #159: Blog page has real content (was empty placeholder)
const posts = [
  {
    id: 1,
    title: "5 Essential Wardrobe Staples Every Man Needs in 2025",
    category: "Style Guide",
    date: "March 10, 2025",
    excerpt: "Building a versatile wardrobe doesn't require spending a fortune. Here are the five pieces that will always serve you well, no matter the occasion.",
    image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=250&fit=crop",
    readTime: "4 min read",
  },
  {
    id: 2,
    title: "How to Style a Linen Shirt for Summer — 3 Different Looks",
    category: "Fashion Tips",
    date: "February 25, 2025",
    excerpt: "Linen shirts are the ultimate summer weapon. From casual brunch to evening out, here's how to wear one shirt three completely different ways.",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=250&fit=crop",
    readTime: "3 min read",
  },
  {
    id: 3,
    title: "The Fabric Guide: Understanding Cotton, Linen, and Blends",
    category: "Education",
    date: "February 12, 2025",
    excerpt: "Not all fabrics are created equal. We break down the most common menswear fabrics so you can make smarter buying decisions.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Urban Drape's Spring 2025 Collection — Behind the Scenes",
    category: "Brand",
    date: "January 28, 2025",
    excerpt: "Go behind the scenes of our Spring 2025 shoot in Mumbai. Discover the inspiration, the fabrics, and the stories behind this season's collection.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=250&fit=crop",
    readTime: "5 min read",
  },
];

const Blog = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">The Urban Drape Journal</h1>
      <p className="text-muted-foreground mb-10 max-w-xl">Style tips, fashion trends, and stories from behind the brand.</p>

      <div className="grid sm:grid-cols-2 gap-8">
        {posts.map((post) => (
          <article key={post.id} className="group bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">{post.category}</span>
                <span className="text-xs text-muted-foreground">{post.readTime}</span>
              </div>
              <h2 className="text-base font-semibold mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <Button variant="ghost" size="sm" className="text-primary p-0 h-auto">Read More →</Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">Want style inspiration delivered to your inbox?</p>
        <Button asChild variant="outline">
          <Link to="/#newsletter">Subscribe to Newsletter</Link>
        </Button>
      </div>
    </main>
    <Footer />
  </div>
);

export default Blog;
