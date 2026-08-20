"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Loader2, Save, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function ProfileSettings() {
  const router = useRouter();
  const { data: session, isPending, refetch } = authClient.useSession();
  const [editedName, setEditedName] = useState<string | null>(null);
  const name = editedName ?? session?.user.name ?? "";
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const updateName = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();

    setNameError("");
    setNameSuccess("");

    if (nextName.length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }

    setSavingName(true);
    try {
      const result = await authClient.updateUser({ name: nextName });
      if (result.error) {
        throw new Error(result.error.message || "Failed to update name.");
      }

      await refetch();
      router.refresh();
      setEditedName(nextName);
      setNameSuccess("Your name has been updated.");
    } catch (caught) {
      setNameError(
        caught instanceof Error ? caught.message : "Failed to update name.",
      );
    } finally {
      setSavingName(false);
    }
  };

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("Choose a password different from your current one.");
      return;
    }

    setSavingPassword(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        throw new Error(
          result.error.message || "The current password is incorrect.",
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(
        "Password changed. Your other signed-in sessions were revoked.",
      );
    } catch (caught) {
      setPasswordError(
        caught instanceof Error ? caught.message : "Failed to change password.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your admin identity and password.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserRound size={19} /> Personal details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateName} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className="text-sm font-medium">
                  Display name
                </label>
                <input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setEditedName(event.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={isPending}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="profile-email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={session?.user.email || ""}
                  readOnly
                  className="mt-1 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Email changes are disabled for this admin account.
                </p>
              </div>
            </div>

            {nameError ? (
              <p role="alert" className="text-sm text-destructive">
                {nameError}
              </p>
            ) : null}
            {nameSuccess ? (
              <p
                role="status"
                className="text-sm text-emerald-700 dark:text-emerald-400"
              >
                {nameSuccess}
              </p>
            ) : null}

            <Button type="submit" disabled={savingName || isPending}>
              {savingName ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {savingName ? "Saving…" : "Save name"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound size={19} /> Change password
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your current password to protect this account change.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={updatePassword} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="text-sm font-medium">
                Current password
              </label>
              <input
                id="current-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="new-password" className="text-sm font-medium">
                  New password
                </label>
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium"
                >
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            {passwordError ? (
              <p role="alert" className="text-sm text-destructive">
                {passwordError}
              </p>
            ) : null}
            {passwordSuccess ? (
              <p
                role="status"
                className="text-sm text-emerald-700 dark:text-emerald-400"
              >
                {passwordSuccess}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <KeyRound size={16} className="mr-2" />
                )}
                {savingPassword ? "Changing…" : "Change password"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />} Show
                Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
