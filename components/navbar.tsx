"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-border">
      <div className="container-main">
        <nav className="flex h-20 items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-3 font-semibold tracking-[-0.04em]"
          >
            <span className="flex size-8 items-center justify-center bg-foreground text-sm text-white">
              N
            </span>

            <span className="text-lg">Nawab Tech</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}

            <a
              href="#contact"
              className="border border-foreground px-5 py-3 text-sm font-medium transition-colors hover:bg-foreground hover:text-white"
            >
              Start a project
            </a>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="flex size-10 items-center justify-center border border-border md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {open && (
          <div className="border-t border-border py-6 md:hidden">
            <div className="flex flex-col">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-4 text-lg"
                >
                  {link.label}
                </a>
              ))}

              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-5 bg-foreground px-5 py-4 text-center text-sm font-medium text-white"
              >
                Start a project
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
