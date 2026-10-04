import { ArrowUpRight, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const serviceLinks = [
  { label: "Business Websites", href: "/services/web-development" },
  {
    label: "Web Applications",
    href: "/services/custom-web-applications",
  },
  {
    label: "Dashboards",
    href: "/services/dashboard-development",
  },
  {
    label: "Automation & Integrations",
    href: "/services/automation-integrations",
  },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border">
      <span aria-hidden className="footer-glow" />

      <div className="container-main">
        {/* Main Footer */}
        <div className="grid border-x border-border lg:grid-cols-12">
          {/* Brand */}
          <div className="border-b border-border p-6 sm:p-10 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-14">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/nawab-tech-logo.png"
                alt="Nawab Tech"
                width={40}
                height={40}
                priority
              />

              <span className="text-sm font-semibold tracking-tight">
                Nawab Tech
              </span>
            </Link>

            <p className="mt-8 max-w-sm leading-relaxed text-muted-foreground">
              Digital products built around the way your business works.
            </p>

            <a
              href="/contact"
              className="group mt-8 flex w-fit items-center gap-2 text-sm font-medium"
            >
              Start a project
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          </div>

          {/* Services */}
          <div className="border-b border-border p-6 sm:p-10 lg:col-span-3 lg:border-b-0 lg:p-14">
            <div className="eyebrow text-muted-foreground">Services</div>

            <nav className="mt-8 flex flex-col gap-4">
              {serviceLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="link-underline w-fit text-sm transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div className="border-b border-border p-6 sm:p-10 lg:col-span-2 lg:border-b-0 lg:border-l lg:p-14">
            <div className="eyebrow text-muted-foreground">Company</div>

            <nav className="mt-8 flex flex-col gap-4">
              {companyLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="w-fit text-sm transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="p-6 sm:p-10 lg:col-span-2 lg:border-l lg:p-14">
            <div className="eyebrow text-muted-foreground">Contact</div>

            <div className="mt-8 flex flex-col gap-4">
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
              >
                <Mail size={15} />
                Email
              </a>

              <a
                href={siteConfig.social.facebook}
                className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-facebook"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                </svg>
                Facebook
              </a>

              <a
                href={siteConfig.social.github}
                className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-github"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col justify-between gap-4 border-x border-t border-border px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-10">
          <span>
            © 2021-{new Date().getFullYear()} Nawab Tech. All rights reserved.
          </span>

          <div className="flex gap-6">
            <a
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </a>

            <a
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
