"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function NavBar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("authedEmail");
      if (saved) setEmail(saved);
    } catch {}
  }, []);

  const name = email ? email : "";

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <a href="/events" className="text-sm font-semibold text-slate-800 hover:opacity-80">Events App</a>
          <nav className="flex items-center gap-3 text-sm">
            <a href="/create" className="text-slate-600 underline hover:text-slate-800">New Event</a>
            <a href="/events" className="text-slate-600 underline hover:text-slate-800">Upcoming Events</a>
            <a href="/events/done" className="text-slate-600 underline hover:text-slate-800">Past Events</a>           
            <a href="/expenses" className="text-slate-600 underline hover:text-slate-800">Expenses</a>
            <a href="/income" className="text-slate-600 underline hover:text-slate-800">Income</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600">
            {name ? (
              <span>
                Welcome, <span className="font-medium text-slate-800">{name}</span>
              </span>
            ) : (
              <span>Welcome</span>
            )}
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}


