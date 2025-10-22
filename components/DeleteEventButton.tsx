"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteEventButton({ id }: { id: string | number | bigint }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete(e: React.MouseEvent<HTMLButtonElement>) {
    const tr = (e.currentTarget as HTMLElement).closest("tr");
    try {
      setLoading(true);
      tr?.classList.add("bg-rose-50", "ring-2", "ring-rose-300");
      const req = fetch(`/api/events/${id}`, { method: "DELETE" });
      const delay = new Promise((r) => setTimeout(r, 1000));
      const res = await Promise.all([req, delay]).then(([r]) => r as Response);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to delete");
      }
      router.refresh();
    } catch (err) {
      // Revert highlight on failure
      tr?.classList.remove("bg-rose-50", "ring-2", "ring-rose-300");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={onDelete} disabled={loading} className="btn-outline text-xs py-1 px-2">
      {loading ? "deleting..." : "Delete"}
    </button>
  );
}

