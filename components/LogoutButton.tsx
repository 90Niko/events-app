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
      className={className ?? "rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"}
    >
      Logout
    </button>
  );
}

