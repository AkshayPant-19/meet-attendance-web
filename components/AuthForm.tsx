"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
              redirect,
            )}`,
          },
        });
        if (error) throw error;
        setNotice(
          "Account created. Check your email to confirm, then log in. (If email confirmation is disabled, you can log in now.)",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirect);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card stack" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1 style={{ fontSize: 24 }}>{isSignup ? "Create your account" : "Log in"}</h1>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </div>
      {error && <p className="error">{error}</p>}
      {notice && <p className="success-text">{notice}</p>}
      <button className="btn primary" type="submit" disabled={busy}>
        {busy ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
      </button>
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>
        {isSignup ? (
          <>
            Already have an account? <Link href="/login">Log in</Link>
          </>
        ) : (
          <>
            No account? <Link href="/signup">Sign up</Link>
          </>
        )}
      </p>
    </form>
  );
}
