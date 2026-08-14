import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Admin Login | Nawab Tech",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Nawab Tech</h1>
          <p className="text-muted-foreground text-sm">Admin Panel</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected area. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
