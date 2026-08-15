import Image from "next/image";

import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";

export const metadata = {
  title: "Forgot Password | Nawab Tech Admin",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/nawab-tech-logo.png"
            alt="Nawab Tech"
            width={52}
            height={52}
            priority
            className="mx-auto mb-3"
          />
          <p className="text-sm font-medium">Nawab Tech Admin</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
