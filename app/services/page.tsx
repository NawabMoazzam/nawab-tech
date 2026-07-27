import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Web Development Services",
  description:
    "Explore Nawab Tech's web development services, including business websites, custom web applications, dashboards, internal tools, and API integrations.",
  alternates: {
    canonical: "/services",
  },
};

const services = [
  {
    number: "01",
    title: "Web Development",
    description:
      "High-performing websites designed to communicate your value clearly and turn visitors into customers.",
    href: "/services/web-development",
  },
  {
    number: "02",
    title: "Custom Web Applications",
    description:
      "Purpose-built applications that help businesses replace disconnected tools and manual workflows.",
    href: "/services/custom-web-applications",
  },
  {
    number: "03",
    title: "Dashboard Development",
    description:
      "Custom dashboards and internal tools that turn business data into clear, actionable information.",
    href: "/services/dashboard-development",
  },
  {
    number: "04",
    title: "API Integrations",
    description:
      "Connect your existing tools and services through reliable integrations and automated workflows.",
    href: "/services/api-integrations",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="editorial-grid">
          <div className="container-main">
            <div className="min-h-[70svh] border-x border-border p-6 pt-24 sm:p-10 sm:pt-32 lg:p-20 lg:pt-40">
              <div className="eyebrow text-muted-foreground">
                Nawab Tech / Services
              </div>

              <h1 className="display-text mt-10 max-w-6xl">
                Digital products
                <br />
                that solve
                <br />
                <span className="text-primary">real problems.</span>
              </h1>

              <p className="mt-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                From business websites to custom software, we build digital
                products around the way your business actually works.
              </p>
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="container-main">
            <div className="border-x border-border">
              {services.map((service) => (
                <a
                  key={service.number}
                  href={service.href}
                  className="group grid border-b border-border p-6 sm:p-10 lg:grid-cols-12 lg:p-14"
                >
                  <div className="lg:col-span-1">
                    <span className="text-xs text-muted-foreground">
                      {service.number}
                    </span>
                  </div>

                  <div className="mt-8 lg:col-span-7 lg:mt-0">
                    <h2 className="text-3xl font-medium tracking-tighter sm:text-5xl">
                      {service.title}
                    </h2>

                    <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-10 flex items-end justify-between lg:col-span-4 lg:mt-0 lg:items-center lg:justify-end">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Explore service
                    </span>

                    <div className="ml-6 flex size-12 items-center justify-center border border-border transition-colors group-hover:bg-foreground group-hover:text-background">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
