import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { getPublishedTestimonials } from "@/lib/testimonials";

export async function Testimonials() {
  const testimonials = await getPublishedTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <section
      className="section-border overflow-hidden"
      aria-labelledby="testimonials-title"
    >
      <div className="container-main">
        <div className="border-x border-border">
          <div className="grid lg:grid-cols-12">
            <div className="p-6 sm:p-10 lg:col-span-7 lg:p-14">
              <div className="eyebrow text-muted-foreground">
                Client feedback
              </div>
              <h2 id="testimonials-title" className="section-title mt-8">
                Kind words from
                <br />
                <span className="text-primary">people we build for.</span>
              </h2>
            </div>

            <div className="flex items-end border-t border-border p-6 sm:p-10 lg:col-span-5 lg:border-l lg:border-t-0 lg:p-14">
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Real feedback from clients who trusted Nawab Tech with their
                websites, products, and digital systems.
              </p>
            </div>
          </div>

          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </div>
    </section>
  );
}
