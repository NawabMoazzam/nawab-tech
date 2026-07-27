import { CapabilityStrip } from "@/components/capability-strip";
import { ContactCTA } from "@/components/contact-cta";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { Process } from "@/components/process";
import { Services } from "@/components/services";
import { Transformation } from "@/components/transformation";
import { WhyNawabTech } from "@/components/why-nawab-tech";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <CapabilityStrip />

        <Transformation />

        <Services />

        <Process />

        <WhyNawabTech />

        <FAQ />

        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
