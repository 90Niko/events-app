"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  function onLogout() {
    try { localStorage.removeItem("authedEmail"); } catch {}
    router.push("/");
  }
  return (
    <button
      type="button"
      onClick={onLogout}
      className={
        className ??
        "relative group inline-flex items-center justify-center rounded-md p-1.5 text-slate-600 hover:text-rose-600 transition-colors"
      }
      aria-label="Logout"
    >
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9l3 3-3 3M15 12H3" />
      </svg>
      <span className="sr-only">Logout</span>
      <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100 group-hover:translate-y-0">
        Logout
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-800" />
      </span>
    </button>
  );
}

