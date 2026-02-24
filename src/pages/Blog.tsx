import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const blogPosts = [
  {
    id: "1",
    title: "How to Build a Minimal Wardrobe",
    excerpt: "Start with versatile basics: neutral tees, chinos, and a well-fitted blazer. Quality over quantity.",
    date: "Feb 2024",
  },
  {
    id: "2",
    title: "Fabric Guide: Cotton vs Linen",
    excerpt: "When to choose cotton for everyday wear and linen for summer. Care tips for both.",
    date: "Jan 2024",
  },
  {
    id: "3",
    title: "Dress Code Decoded: Smart Casual",
    excerpt: "What smart casual really means and how to nail it for work and weekend.",
    date: "Dec 2023",
  },
];

const Blog = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Blog</h1>
      <p className="text-muted-foreground mb-8">
        Style tips, fabric guides, and fashion trends. More articles coming soon.
      </p>
      <div className="space-y-4">
        {blogPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <p className="text-xs text-muted-foreground">{post.date}</p>
              <h2 className="text-lg font-semibold">{post.title}</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default Blog;
