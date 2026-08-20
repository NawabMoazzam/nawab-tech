"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({
  token,
  tokenError,
}: {
  token?: string;
  tokenError?: string;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    tokenError ? "This password reset link is invalid or has expired." : "",
  );
  const [complete, setComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This password reset link is invalid or has expired.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (result.error) {
        throw new Error(
          result.error.message ||
            "This password reset link is invalid or has expired.",
        );
      }

      setNewPassword("");
      setConfirmPassword("");
      setComplete(true);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The password could not be reset.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          {complete ? <CheckCircle2 size={21} /> : <KeyRound size={21} />}
          {complete ? "Password updated" : "Choose a new password"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {complete
            ? "You can now sign in with your new password."
            : "Use at least 8 characters and choose a password you do not use elsewhere."}
        </p>
      </CardHeader>
      <CardContent>
        {complete ? (
          <div className="space-y-4">
            <div
              role="status"
              className="rounded-md bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400"
            >
              Your password was reset and existing sessions were signed out.
            </div>
            <Link
              href="/admin/login"
              className={buttonVariants({ className: "w-full" })}
            >
              Continue to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-reset-password"
                className="text-sm font-medium"
              >
                New password
              </label>
              <input
                id="new-reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={!token || Boolean(tokenError)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-reset-password"
                className="text-sm font-medium"
              >
                Confirm new password
              </label>
              <input
                id="confirm-reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={!token || Boolean(tokenError)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <input
                id="show-password"
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
                className="h-4 w-4 rounded border border-input bg-background accent-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <label htmlFor="show-password" className="text-sm font-medium">
                Show passwords
              </label>
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            {token && !tokenError ? (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting…" : "Reset password"}
              </Button>
            ) : (
              <Link
                href="/admin/login/forgot"
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full",
                })}
              >
                Request a new link
              </Link>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
