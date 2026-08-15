"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/admin/login/reset`,
      });

      if (result.error) {
        throw new Error(
          result.error.message || "The reset email could not be sent.",
        );
      }

      setSent(true);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The reset email could not be sent.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {sent ? "Check your inbox" : "Forgot your password?"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {sent
            ? "If an admin account exists for that email, a reset link is on its way."
            : "Enter your admin email and we’ll send a secure reset link."}
        </p>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md bg-primary/10 p-4 text-sm">
              <Mail size={18} className="mt-0.5 shrink-0 text-primary" />
              <p>
                The link expires in one hour. Check your spam folder if it does
                not arrive after a few minutes.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false);
                setError("");
              }}
            >
              Send another link
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="admin@nawabtech.com"
              />
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <Link
          href="/admin/login"
          className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
