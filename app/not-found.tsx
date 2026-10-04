import { ArrowUpRight } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex grow flex-col items-center justify-center px-6 text-center">
          <h1 className="display-text float-soft text-primary">404</h1>

          <h2
            data-reveal="up"
            className="eyebrow mt-6 text-2xl font-medium sm:text-3xl"
          >
            This page moved on without us
          </h2>

          <p
            data-reveal="up"
            style={{ transitionDelay: "120ms" }}
            className="mt-5 max-w-md leading-relaxed text-muted-foreground"
          >
            The page you are looking for does not exist — but the work we do
            does. Let&apos;s get you back to solid ground.
          </p>

          <Link
            href="/"
            data-reveal="up"
            style={{ transitionDelay: "220ms" }}
            className="premium-button group mt-10 flex items-center gap-3 bg-primary px-6 py-4 text-sm font-medium text-primary-foreground"
          >
            Go back home
            <ArrowUpRight
              size={17}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </main>
      </div>
      <Footer />
    </>
  );
}
