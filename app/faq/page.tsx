import { FAQ } from "@/components/faq";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <section className="editorial-grid">
        <div className="container-main">
          <div className="min-h-[70svh] border-x border-border p-6 pt-24 sm:p-10 sm:pt-32 lg:p-20 lg:pt-40">
            <div className="eyebrow text-muted-foreground">
              Nawab Tech / FAQs
            </div>

            <h1 className="display-text mt-10 max-w-6xl">
              Frequently Asked
              <br />
              <span className="text-primary">Questions</span>
            </h1>

            <p className="mt-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Not sure if we&apos;re the right fit? Here are some of the
              questions we hear most often.
            </p>
          </div>
        </div>
      </section>
      <FAQ />
      <Footer />
    </>
  );
}
