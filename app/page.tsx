import { CapabilityStrip } from "@/components/capability-strip";
// import { FAQ } from "@/components/faq";
// import { FinalCTA } from "@/components/final-cta";
// import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
// import { Process } from "@/components/process";
// import { SelectedWork } from "@/components/selected-work";
import { Solutions } from "@/components/solutions";
// import { TechStack } from "@/components/tech-stack";
// import { Transformation } from "@/components/transformation";
// import { WhyNawabTech } from "@/components/why-nawab-tech";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <CapabilityStrip />

        <Solutions />

        {/* <Transformation />

        <SelectedWork />

        <WhyNawabTech />

        <Process />

        <TechStack />

        <FAQ />

        <FinalCTA /> */}
      </main>

      {/* <Footer /> */}
    </>
  );
}
