"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Plus,
  Settings,
  Image as ImageIcon,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/posts/new", label: "New Post", icon: Plus },
];

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {session?.user && (
        <aside className="w-64 border-r bg-background p-4 flex flex-col overflow-auto">
          <div className="mb-8">
            <Link
              href="/admin"
              className="font-bold text-xl tracking-tight flex items-center gap-2"
            >
              <Image
                src="/nawab-tech-logo.png"
                alt="Nawab Tech"
                width={40}
                height={40}
                priority
              />
              <div className="flex flex-col">
                Nawab Tech
                <span className="block text-xs font-normal text-muted-foreground">
                  Admin Panel
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
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

          <div className="mt-auto space-y-4 relative">
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-medium truncate">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {session?.user?.email || "Admin"}
                {session?.user?.emailVerified ? (
                  <BadgeCheck
                    size={12}
                    className="inline-block ml-1 text-primary"
                  />
                ) : null}
              </p>
              <Badge
                variant="default"
                className="absolute -top-2 right-2 text-[10px] px-1 py-0.5"
              >
                {session?.user?.role || "Admin"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
            <Link
              href="/"
              className="block text-xs text-center text-muted-foreground hover:text-foreground"
            >
              ← Back to site
            </Link>
          </div>
        </aside>
      )}

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
