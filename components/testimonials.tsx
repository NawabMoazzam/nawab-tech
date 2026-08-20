import Image from "next/image";
import { Quote } from "lucide-react";

import { getPublishedTestimonials } from "@/lib/testimonials";

export async function Testimonials() {
  const testimonials = await getPublishedTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <section className="section-border" aria-labelledby="testimonials-title">
      <div className="container-main">
        <div className="grid border-x border-border lg:grid-cols-12">
          <div className="p-6 sm:p-10 lg:col-span-4 lg:p-14">
            <div className="eyebrow text-muted-foreground">Client feedback</div>
            <h2 id="testimonials-title" className="section-title mt-8">
              Built together.
              <br />
              <span className="text-primary">Proven in use.</span>
            </h2>
          </div>

          <div className="border-t border-border p-6 sm:p-10 lg:col-span-8 lg:border-l lg:border-t-0 lg:p-14">
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              The clearest measure of good work is what it changes for the
              people and businesses using it.
            </p>
          </div>
        </div>

        <div className="grid gap-px border border-border bg-border md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item._id}
              className="flex min-h-96 flex-col justify-between bg-background p-6 sm:p-10"
            >
              <div>
                <Quote
                  size={28}
                  strokeWidth={1.3}
                  className="text-primary"
                  aria-hidden
                />
                <blockquote className="mt-8 text-xl leading-relaxed tracking-[-0.025em] sm:text-2xl">
                  “{item.testimonial}”
                </blockquote>
              </div>

              <figcaption className="mt-12 flex items-center gap-4 border-t border-border pt-6">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                  <Image
                    src={item.avatar}
                    alt={`${item.name} avatar`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-medium">{item.name}</div>
                  {item.role ? (
                    <div className="mt-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                      {item.role}
                    </div>
                  ) : null}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
