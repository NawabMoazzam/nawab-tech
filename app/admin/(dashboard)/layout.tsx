import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  let session: Awaited<
    ReturnType<(Awaited<ReturnType<typeof getAuth>>)["api"]["getSession"]>
  > | null = null;

  try {
    const auth = await getAuth();
    session = await auth.api.getSession({ headers: requestHeaders });
  } catch (error) {
    console.error("Admin session verification failed:", error);
  }

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <AdminSidebar
      user={{
        name: session.user.name || "Admin",
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        role: (session.user as { role?: string }).role || "admin",
      }}
    >
      {children}
    </AdminSidebar>
  );
}
