"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({
  callbackURL = "/admin",
}: {
  callbackURL?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL,
      });

      if (result.error) {
        throw new Error(
          result.error.message || "Sign in failed. Check your credentials.",
        );
      }

      router.replace(callbackURL);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something went wrong.",
      );
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the admin panel.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="admin@nawabtech.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="login-password" className="text-sm font-medium">
                Password
              </label>
              <Link
                href="/admin/login/forgot"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm"
                placeholder="••••••••"
                minLength={8}
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute bottom-1 right-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye size={16} className="text-primary" />
                ) : (
                  <EyeOff size={16} />
                )}
              </Button>
            </div>
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
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
