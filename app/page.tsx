import { CapabilityStrip } from "@/components/capability-strip";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { Transformation } from "@/components/transformation";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <CapabilityStrip />

        <Transformation />
      </main>
    </>
  );
}
