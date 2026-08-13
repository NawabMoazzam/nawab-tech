"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
          callbackURL,
        });
        if (res.error) {
          setError(res.error.message || "Sign up failed");
          setLoading(false);
          return;
        }
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
          callbackURL,
        });
        // Better Auth returns { data, error }
        if (res.error) {
          setError(res.error.message || "Login failed. Check credentials.");
          setLoading(false);
          return;
        }
      }
      router.push(callbackURL);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{isSignUp ? "Create Admin Account" : "Welcome back"}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {isSignUp
            ? "First account will be admin. Use strong password."
            : "Enter your credentials to access admin panel"}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                required={isSignUp}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Nawab Moazzam"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="admin@nawabtech.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="••••••••"
              minLength={8}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              {isSignUp ? "Already have account? Sign in" : "First time? Create admin account"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            Better Auth + MongoDB. Session stored in httpOnly cookie.<br />
            <span className="font-medium">Tip for Arena AI:</span> After first signup, set role to admin in DB manually or via seed script.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
