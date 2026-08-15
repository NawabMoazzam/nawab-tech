import Image from "next/image";

import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Admin Login | Nawab Tech",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ callbackURL?: string | string[] }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const requestedCallback = Array.isArray(params.callbackURL)
    ? params.callbackURL[0]
    : params.callbackURL;
  const callbackURL =
    requestedCallback?.startsWith("/admin") &&
    !requestedCallback.startsWith("//") &&
    !requestedCallback.startsWith("/admin/login")
      ? requestedCallback
      : "/admin";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/nawab-tech-logo.png"
            alt="Nawab Tech"
            width={56}
            height={56}
            priority
            className="mx-auto mb-3"
          />
          <h1 className="text-3xl font-bold tracking-tight">Nawab Tech</h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>
        <LoginForm callbackURL={callbackURL} />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected area. Authorised personnel only.
        </p>
      </div>
    </main>
  );
}
