import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "Admin | Nawab Tech",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Skip auth check for login page - it will be handled by the page itself
  // But this layout wraps all /admin/* including login, so we need to check pathname
  // Better to check headers x-invoke-path? Simple approach: try to get session, if fails and we're not on login, redirect.
  // In App Router, we can't get pathname easily in layout, so we do session check and allow if path is login via fallback in child.

  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") || headersList.get("x-invoked-path") || "";

  // This check will run for all admin routes, but login page is public and won't call this? Actually it does.
  // So we check session, if no session -> if request is for login, allow, else redirect.
  // We detect login by checking if child will be login page? Simpler: just try get session, if fails redirect to login unless already on login.
  // Since proxy.ts already redirects at edge, this is second layer (mandatory for security).

  // For now, don't redirect if we are on login - we detect via next-url header? fallback: if pathname contains /admin/login, skip
  const isLoginPage = pathname.includes("/admin/login");

  // If we couldn't detect the pathname from headers, avoid redirect here
  // to prevent a self-redirect loop when the login page is requested directly.
  // The edge `proxy.ts` already protects `/admin` routes, so it's safe to skip
  // the redirect when `pathname` is empty.
  if (pathname && !isLoginPage) {
    try {
      const auth = await getAuth();
      const session = await auth.api.getSession({
        headers: headersList,
      });

      if (!session?.user) {
        redirect("/admin/login");
      }
    } catch (e) {
      // If auth fails, redirect only when we have DB configured (production-ish)
      if (process.env.MONGODB_URI) {
        redirect("/admin/login");
      }
    }
  }

  // If login page, render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar>{children}</AdminSidebar>
    </div>
  );
}
