import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

// Bug #160: Careers page has real content (was empty placeholder)
const openings = [
  {
    title: "Senior Full-Stack Developer",
    department: "Engineering",
    location: "Mumbai / Remote",
    type: "Full-time",
    description: "Build and scale our e-commerce platform. Strong skills in Node.js, React, and MongoDB required.",
  },
  {
    title: "Fashion Merchandiser",
    department: "Product",
    location: "Mumbai",
    type: "Full-time",
    description: "Curate and manage our product catalog. Experience in menswear buying and trend forecasting preferred.",
  },
  {
    title: "Customer Success Executive",
    department: "Operations",
    location: "Mumbai / Hybrid",
    type: "Full-time",
    description: "Deliver exceptional post-purchase experiences. Excellent communication skills and attention to detail required.",
  },
  {
    title: "Digital Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Drive growth through SEO, SEM, and social media campaigns. Experience with D2C fashion brands is a plus.",
  },
];

const Careers = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1">
      <div className="bg-foreground text-background py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Careers at Urban Drape</h1>
        <p className="text-background/70 text-lg max-w-xl mx-auto">
          Join a passionate team redefining premium menswear in India.
        </p>
      </div>

      <div className="container px-4 md:px-8 py-12 max-w-4xl mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-3">Why Work With Us?</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: "🚀", title: "High Growth", desc: "Be part of a fast-growing D2C brand with real ownership and impact." },
              { icon: "🤝", title: "Collaborative Culture", desc: "Flat hierarchy, open communication, and a team that genuinely cares." },
              { icon: "💡", title: "Learn & Grow", desc: "Regular learning sessions, mentorship, and career development support." },
            ].map(item => (
              <div key={item.title} className="bg-secondary/40 rounded-xl p-5">
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((job) => (
              <div key={job.title} className="border rounded-xl p-6 bg-card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">{job.department}</span>
                      <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">{job.location}</span>
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">{job.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="flex-shrink-0" asChild>
                    <a href={`mailto:careers@urbandrape.com?subject=Application: ${encodeURIComponent(job.title)}`}>
                      Apply Now
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 text-center bg-secondary/40 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-2">Don't see your role?</h3>
          <p className="text-muted-foreground mb-4">Send us your resume and we'll reach out when a suitable opening comes up.</p>
          <Button asChild>
            <a href="mailto:careers@urbandrape.com">Send Resume</a>
          </Button>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Careers;
