import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Briefcase, MapPin, Clock, Mail, Heart, Sparkles, Users } from "lucide-react";

const openings = [
  {
    title: "Senior Product Designer",
    location: "Mumbai, India",
    type: "Full-time",
    department: "Design",
    description: "Lead end-to-end design for our shop, mobile app, and in-store kiosks. You'll partner closely with engineering and merchandising.",
  },
  {
    title: "Backend Engineer (Node.js)",
    location: "Remote (India)",
    type: "Full-time",
    department: "Engineering",
    description: "Own services that power checkout, inventory, and order management. Strong TypeScript and MongoDB experience preferred.",
  },
  {
    title: "Retail Associate",
    location: "Bengaluru — Indiranagar Store",
    type: "Full-time",
    department: "Retail",
    description: "Be the first face customers see when they walk into our flagship. Two years of premium retail experience required.",
  },
];

const values = [
  { icon: Heart, title: "People first", body: "Our team gets full-cover health insurance, generous parental leave, and a real four-day workweek pilot." },
  { icon: Sparkles, title: "Make the work better", body: "We ship in small steps and review each one. Craft beats output here." },
  { icon: Users, title: "Quiet, kind teams", body: "No heroes, no death-marches. Disagree-and-commit, then move on." },
];

const Careers = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <SEO title="Careers" description="Join the Urban Drape team." />
    <Header />
    <main className="flex-1">
      <section className="container px-4 md:px-8 py-12 md:py-20 max-w-5xl">
        <span className="text-xs uppercase tracking-widest text-primary font-semibold">Careers</span>
        <h1 className="text-3xl md:text-5xl font-bold mt-3 mb-4">Build the next era of considered fashion</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Urban Drape is a small, profitable team making clothes we want to wear for a long time. If that sounds like the kind of place you'd like to work, we'd love to hear from you.
        </p>
      </section>

      <section className="bg-secondary/30 border-y">
        <div className="container px-4 md:px-8 py-12 md:py-16 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">How we work</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl bg-background p-6 border">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container px-4 md:px-8 py-12 md:py-16 max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Open positions</h2>
        <p className="text-muted-foreground mb-8">We hire for skill, judgement, and kindness — in that order.</p>

        <div className="space-y-4">
          {openings.map((job) => (
            <article key={job.title} className="rounded-xl border bg-card p-5 md:p-6 hover:border-primary/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{job.department}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{job.type}</span>
                  </div>
                </div>
                <a
                  href={`mailto:urbandrape25@gmail.com?subject=Application: ${encodeURIComponent(job.title)}`}
                  className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Apply
                </a>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border bg-secondary/30 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-1">Don't see your role?</h3>
            <p className="text-sm text-muted-foreground">Send us a note. We're always interested in talking to thoughtful people.</p>
          </div>
          <a
            href="mailto:urbandrape25@gmail.com?subject=General%20application"
            className="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <Mail className="h-4 w-4" />
            urbandrape25@gmail.com
          </a>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Careers;
