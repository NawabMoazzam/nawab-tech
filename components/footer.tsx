import { ArrowUpRight, Mail } from "lucide-react";

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
    label: "API Integrations",
    href: "/services/api-integrations",
  },
];

const companyLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-main">
        {/* Main Footer */}
        <div className="grid border-x border-border lg:grid-cols-12">
          {/* Brand */}
          <div className="border-b border-border p-6 sm:p-10 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-14">
            <a
              href="#"
              className="flex w-fit items-center gap-3 font-semibold tracking-[-0.04em]"
            >
              <span className="flex size-9 items-center justify-center bg-foreground text-sm text-background">
                N
              </span>

              <span className="text-lg">Nawab Tech</span>
            </a>

            <p className="mt-8 max-w-sm leading-relaxed text-muted-foreground">
              Digital products built around the way your business works.
            </p>

            <a
              href="#contact"
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
                  className="w-fit text-sm transition-colors hover:text-primary"
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
                href="mailto:hello@nawabtech.com"
                className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
              >
                <Mail size={15} />
                Email
              </a>

              <a
                href="#"
                className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-linkedin"
                  viewBox="0 0 16 16"
                >
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
                </svg>
                LinkedIn
              </a>

              <a
                href="#"
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
            © {new Date().getFullYear()} Nawab Tech. All rights reserved.
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
