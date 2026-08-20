"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Plus,
  UserRound,
  X,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/posts/new", label: "New Post", icon: Plus },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: MessageSquareQuote,
  },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
];

type AdminUser = {
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
};

function isNavItemActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  if (href === "/admin/posts") {
    return (
      pathname === href ||
      (pathname.startsWith("/admin/posts/") &&
        pathname !== "/admin/posts/new")
    );
  }
  if (href === "/admin/posts/new") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AdminUser;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await authClient.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  const sidebarContent = (
    <>
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-bold tracking-tight"
          onClick={() => setDrawerOpen(false)}
        >
          <Image
            src="/nawab-tech-logo.png"
            alt="Nawab Tech"
            width={40}
            height={40}
            priority
          />
          <span className="flex flex-col text-lg leading-tight">
            Nawab Tech
            <span className="text-xs font-normal text-muted-foreground">
              Admin Panel
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-md hover:bg-muted md:hidden"
          aria-label="Close navigation"
          onClick={() => setDrawerOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Admin navigation">
        {navItems.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-8 space-y-4">
        <Link
          href="/admin/profile"
          onClick={() => setDrawerOpen(false)}
          className="block rounded-md bg-muted p-3 transition-colors hover:bg-muted/80"
        >
          <p className="truncate text-xs font-medium">{user.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {user.email}
            {user.emailVerified ? (
              <BadgeCheck
                size={12}
                className="ml-1 inline-block text-primary"
                aria-label="Verified email"
              />
            ) : null}
          </p>
          <Badge
            variant="default"
            className="absolute -top-2 right-2 px-1 py-0.5 text-[10px] capitalize"
          >
            {user.role}
          </Badge>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="grow"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={16} className="mr-2" />
            {loggingOut ? "Signing out…" : "Logout"}
          </Button>
          <ThemeToggle />
        </div>

        <Link
          href="/"
          className="block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to site
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-background md:flex">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Image
            src="/nawab-tech-logo.png"
            alt="Nawab Tech"
            width={34}
            height={34}
            priority
          />
          <span>Admin</span>
        </Link>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-md border hover:bg-muted"
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          aria-controls="admin-mobile-navigation"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={21} />
        </button>
      </header>

      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r bg-background p-4 md:flex">
        {sidebarContent}
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            id="admin-mobile-navigation"
            className="relative flex h-dvh w-[min(20rem,88vw)] flex-col overflow-y-auto border-r bg-background p-4 shadow-2xl"
            aria-label="Mobile admin navigation"
          >
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <main className="min-w-0 flex-1 p-4 sm:p-6 md:h-dvh md:overflow-y-auto md:p-8">
        {children}
      </main>
    </div>
  );
}
