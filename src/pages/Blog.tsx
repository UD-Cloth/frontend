import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Calendar, User } from "lucide-react";

const posts = [
  {
    slug: "linen-care-guide",
    title: "The Definitive Linen Care Guide",
    excerpt: "Everything you need to keep your linen pieces looking crisp through the years — from washing temperatures to storage hacks.",
    date: "2026-04-20",
    author: "Aanya Mehta",
    image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=1200&q=80",
    category: "Care & Craft",
  },
  {
    slug: "summer-staples-2026",
    title: "Five Summer Staples Every Wardrobe Needs",
    excerpt: "We narrowed our buying team's 200+ samples down to the five pieces we'd grab on the way out the door this summer.",
    date: "2026-04-08",
    author: "Rohan Shah",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=1200&q=80",
    category: "Style Notes",
  },
  {
    slug: "behind-the-stitch",
    title: "Behind the Stitch: Visiting Our Tirupur Atelier",
    excerpt: "A photo essay from the small workshop where every Urban Drape tee is cut, sewn, and finished by hand.",
    date: "2026-03-22",
    author: "Editorial Team",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
    category: "People",
  },
];

const Blog = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <SEO title="Blog" description="Stories from Urban Drape — style notes, craft, and people." />
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-6xl">
      <header className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">The Drape Journal</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Stories about the clothes we make, the people who make them, and the way we wear them.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.slug} className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card transition-shadow hover:shadow-lg">
            <Link to="#" className="block aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <div className="flex flex-col flex-1 p-5 md:p-6">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
                {post.category}
              </span>
              <h2 className="text-lg md:text-xl font-semibold mb-2 line-clamp-2">{post.title}</h2>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3 mt-auto">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {post.author}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border bg-secondary/30 p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">More stories coming soon</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          We publish a new piece roughly every two weeks. Subscribe in the footer to get them in your inbox first.
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Blog;
