"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("error") === "unauthorized";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    unauthorized
      ? "This account is not authorized for the admin console. Sign in with an admin account."
      : null,
  );
  const [pending, setPending] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function prepareLogin() {
      try {
        const session = await authClient.getSession();
        const role = session.data?.user?.role;

        if (role === "admin") {
          const redirectTo = searchParams.get("redirect") || "/dashboard";
          router.replace(redirectTo);
          return;
        }

        // Clear retailer/portal sessions so admin login can proceed.
        if (session.data?.user || unauthorized) {
          await authClient.signOut();
          if (!cancelled && !unauthorized) {
            setError(
              "Signed out of a non-admin session. Sign in with an admin account.",
            );
          }
        }
      } catch {
        // Ignore session probe failures; user can still try signing in.
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    void prepareLogin();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams, unauthorized]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      // Ensure we are not still holding a retailer session cookie.
      await authClient.signOut().catch(() => undefined);

      const { error: signInErr } = await authClient.signIn.email({
        email,
        password,
      });

      if (signInErr) {
        setError(
          signInErr.code === "INVALID_EMAIL_OR_PASSWORD"
            ? "Incorrect email or password."
            : (signInErr.message ?? "Sign in failed."),
        );
        setPending(false);
        return;
      }

      const session = await authClient.getSession();
      const role = session.data?.user?.role;

      if (role !== "admin") {
        await authClient.signOut();
        setError("This account is not authorized for the admin console.");
        setPending(false);
        return;
      }

      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to the server.",
      );
      setPending(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Preparing sign in…
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md border-white/60 bg-white/90 shadow-lg backdrop-blur">
      <CardHeader className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          SafeReceipts
        </p>
        <CardTitle className="font-display text-2xl">Admin sign in</CardTitle>
        <p className="text-muted-foreground text-sm">
          Platform operators only. Retailer accounts cannot access this console.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
