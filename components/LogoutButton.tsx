"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  function onLogout() {
    try { localStorage.removeItem("authedEmail"); } catch {}
    router.push("/");
  }
  return (
    <button type="button" onClick={onLogout} className={className ?? "btn-outline"}>
      Logout
    </button>
  );
}
