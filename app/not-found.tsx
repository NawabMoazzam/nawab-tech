import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex flex-col items-center justify-center text-center grow">
          <h1 className="text-6xl font-bold mb-4 display-text eyebrow text-primary">
            404
          </h1>
          <h2 className="text-4xl font-semibold mb-4 display-text eyebrow">
            <span className="text-primary">Oops!</span> Page Not Found
          </h2>
          <p className="text-lg mb-4">
            The page you are looking for does not exist.
          </p>
          <Link href="/" className="text-blue-500 hover:underline">
            Go back home
          </Link>
        </main>
      </div>
      <Footer />
    </>
  );
}
