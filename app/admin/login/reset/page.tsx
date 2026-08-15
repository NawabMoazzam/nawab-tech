import Image from "next/image";

import { ResetPasswordForm } from "@/components/admin/reset-password-form";

export const metadata = {
  title: "Reset Password | Nawab Tech Admin",
  robots: { index: false, follow: false },
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
    error?: string | string[];
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const tokenError = Array.isArray(params.error)
    ? params.error[0]
    : params.error;

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
        <ResetPasswordForm token={token} tokenError={tokenError} />
      </div>
    </main>
  );
}
