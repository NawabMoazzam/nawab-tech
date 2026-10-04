import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ProjectForm } from "@/components/project-form";

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Tell Nawab Tech about your website, web application, dashboard, or software project and let&apos;s discuss the best way to build it.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  return (
    <>
      <Navbar />

      <main>
        <section className="editorial-grid">
          <div className="container-main">
            <div className="border-x border-border p-6 pt-24 sm:p-10 sm:pt-32 lg:p-20 lg:pt-40">
              <div className="eyebrow text-muted-foreground">
                Nawab Tech / Start a Project
              </div>

              <h1 className="display-text mt-10 max-w-6xl">
                Tell us what
                <br />
                you&apos;re trying
                <br />
                to <span className="text-primary">build.</span>
              </h1>

              <p
                data-reveal="up"
                style={{ transitionDelay: "240ms" }}
                className="mt-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
              >
                Have a clear project in mind, or just know that something in
                your business needs to work better? Tell us what&apos;s going
                on. We&apos;ll help you figure out the next step.
              </p>
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="container-main">
            <div className="grid border-x border-border lg:grid-cols-12">
              <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
                <div className="eyebrow text-muted-foreground">
                  Project enquiry
                </div>

                <h2 className="section-title mt-8">
                  Let&apos;s
                  <br />
                  start with
                  <br />
                  <span className="text-primary">the basics.</span>
                </h2>

                <p className="mt-8 max-w-sm leading-relaxed text-muted-foreground">
                  You don&apos;t need to have everything figured out. Give us
                  enough context to understand what you&apos;re trying to
                  achieve.
                </p>
              </div>

              <div className="border-t border-border lg:col-span-8 lg:border-l lg:border-t-0">
                <div data-reveal="up" style={{ transitionDelay: "160ms" }}>
                  <ProjectForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="container-main">
            <div className="grid border-x border-border sm:grid-cols-2">
              <a
                href={`https://wa.me/${contactPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group border-b border-border p-6 transition-colors hover:bg-muted sm:border-b-0 sm:border-r sm:p-10 lg:p-14"
              >
                <div className="eyebrow text-muted-foreground">
                  Prefer messaging?
                </div>

                <h2 className="mt-8 text-3xl font-medium tracking-tighter">
                  Talk on WhatsApp
                </h2>

                <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
                  If you&apos;d rather have a quick conversation before filling
                  out a form, send us a message directly.
                </p>

                <span className="mt-8 inline-block text-sm font-medium text-primary">
                  Open WhatsApp →
                </span>
              </a>

              <a
                href={`mailto:${contactEmail}`}
                className="group p-6 transition-colors hover:bg-muted sm:p-10 lg:p-14"
              >
                <div className="eyebrow text-muted-foreground">
                  Prefer email?
                </div>

                <h2 className="mt-8 text-3xl font-medium tracking-tighter">
                  Send an email
                </h2>

                <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
                  Have a detailed brief or documentation? You can send
                  everything directly to our inbox.
                </p>

                <span className="mt-8 inline-block text-sm font-medium text-primary">
                  Send an email →
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
