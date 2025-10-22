"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const allowedEmails = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export default function Page() {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("authedEmail") : null;
      if (saved && allowedEmails.includes(saved.toLowerCase())) {
        // auto-redirect to events when already signed in
        router.replace("/events");
        return;
      }
      if (saved && !allowedEmails.includes(saved.toLowerCase())) {
        // env changed; clear old value
        localStorage.removeItem("authedEmail");
      }
    } catch {
      // ignore
    }
  }, [router]);

  function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError(null);
    const email = loginEmail.trim().toLowerCase();
    if (!email) {
      setLoginError("Please enter an email.");
      return;
    }
    if (!allowedEmails.length) {
      setLoginError("No allowed emails configured (env).");
      return;
    }
    if (allowedEmails.includes(email)) {
      try { localStorage.setItem("authedEmail", email); } catch {}
      router.push("/events");
    } else {
      setLoginError("Email is not allowed.");
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-white relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.200)_1px,transparent_1px)] [background-size:24px_24px] opacity-[.35]" />
      </div>

      <div className="relative mx-auto max-w-md px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur p-6">
          <h1 className="text-2xl font-semibold text-slate-800">Sign in</h1>
          <p className="mt-1 text-slate-500 text-sm">Access is restricted to allowed emails.</p>
          {savedEmail ? (
            <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Signed in as <span className="font-medium">{savedEmail}</span>.
              <div className="mt-2 flex gap-2">
                <button onClick={() => router.push("/events")} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700" type="button">Continue</button>
                <button onClick={() => { try { localStorage.removeItem("authedEmail"); } catch {} setSavedEmail(null); }} className="rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-emerald-700 hover:bg-emerald-100" type="button">Sign out</button>
              </div>
            </div>
          ) : null}

          <form onSubmit={onLogin} className="mt-4 flex flex-col gap-3">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none shadow-sm placeholder:text-slate-400 ring-0 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100 transition"
              />
              {loginError ? (
                <p className="mt-1 text-sm text-rose-600">{loginError}</p>
              ) : null}
            </div>
            <div>
              <button type="submit" className="btn-primary">
                Sign in
              </button>
            </div>
            {process.env.NEXT_PUBLIC_ALLOWED_EMAILS ? (
              <p className="text-xs text-slate-400">Allowed emails: {process.env.NEXT_PUBLIC_ALLOWED_EMAILS}</p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
