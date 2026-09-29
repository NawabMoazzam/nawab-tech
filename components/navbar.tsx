"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { navLinks } from "@/lib/nav-links";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-border bg-background">
      <div className="container-main">
        <nav className="flex h-20 items-center justify-between px-6 sm:px-0">
          {/* Brand */}
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

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            <div className="ml-2">
              <ThemeToggle />
            </div>

            <Link
              href="/contact"
              className="nav-cta bg-foreground px-5 py-3 text-sm font-medium text-background transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start a project
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="flex size-10 items-center justify-center border border-border"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {open && (
          <div className="border-t border-border p-6 md:hidden">
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-4 text-lg"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-5 bg-foreground px-5 py-4 text-center text-sm font-medium text-background"
              >
                Start a project
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
