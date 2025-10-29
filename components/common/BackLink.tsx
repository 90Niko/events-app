"use client";

import { useRouter } from "next/navigation";

export default function BackLink({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.back()} className={className ?? "btn-outline text-xs"}>
      Back
    </button>
  );
}

