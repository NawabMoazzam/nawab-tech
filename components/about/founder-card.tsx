import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { personSchema } from "@/lib/schema-markup";

export function FounderCard() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
      <section id="founder" className="section-border">
        <div className="container-main">
          <div className="grid border-x border-border lg:grid-cols-2">
            {/* Visual */}
            <div className="relative min-h-125 overflow-hidden border-b border-border bg-muted lg:min-h-175 lg:border-b-0 lg:border-r group">
              <Image
                src="/profile.jpg"
                alt="Nawab, founder of Nawab Tech"
                fill
                className="object-cover transition-all duration-1000 group-hover:scale-105 group-hover:brightness-110 p-4"
              />
              {/* <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex size-48 items-center justify-center border border-foreground/10 sm:size-64">
                <div className="absolute inset-6 border border-foreground/10" />

                <span className="relative text-7xl font-medium tracking-[-0.08em] text-primary sm:text-8xl">
                  NT
                </span>
              </div>
            </div> */}

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between sm:bottom-10 sm:left-10 sm:right-10 bg-primary/5 p-4 backdrop-blur-sm border rounded-md">
                <span className="text-xs uppercase tracking-[0.15em] text-gray-800">
                  The person behind the studio
                </span>

                <span className="text-xs text-gray-800">Nawab Tech / 01</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14">
              <div>
                <div className="eyebrow text-muted-foreground">Founder</div>

                <h2 className="mt-8 text-4xl font-medium tracking-[-0.06em] sm:text-5xl">
                  Moazzam Nawab
                </h2>

                <p className="mt-3 text-sm text-muted-foreground">
                  Founder & Developer
                </p>

                <div className="mt-12 space-y-6 text-lg leading-relaxed text-muted-foreground">
                  <p>
                    Nawab Tech is built around a simple idea: Technology should
                    make businesses easier to run, not harder.
                  </p>

                  <p>
                    I work with businesses to understand how they operate,
                    identify where technology can genuinely help, and build
                    digital products around those needs.
                  </p>

                  <p>
                    From a business website to a custom application or internal
                    dashboard, the goal is always the same — build something
                    useful, clear, and built to last.
                  </p>
                </div>
              </div>

              <div className="mt-16 border-t border-border pt-6">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-3 text-sm font-medium"
                >
                  Start a conversation
                  <span className="flex size-9 items-center justify-center border border-border transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-foreground group-hover:text-background">
                    <ArrowUpRight size={16} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
