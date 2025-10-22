"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MarkDoneButton({ id }: { id: string | number | bigint }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      setLoading(true);
      // Visually highlight the row while updating
      const tr = (e.currentTarget as HTMLElement).closest("tr");
      tr?.classList.add("bg-emerald-50", "ring-2", "ring-emerald-300");
      const req = fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      const delay = new Promise((r) => setTimeout(r, 2000));
      await Promise.all([req, delay]);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={onClick} disabled={loading} className="btn-outline text-xs py-1 px-2" title="Mark as done">
      {loading ? "updating..." : "Mark done"}
    </button>
  );
}
