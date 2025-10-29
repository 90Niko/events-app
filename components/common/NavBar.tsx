"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/common/LogoutButton";

export default function NavBar() {
  const [email, setEmail] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("authedEmail");
      if (saved) setEmail(saved);
    } catch {}
  }, []);

  const name = email ? email : "";

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <a href="/events" className="text-sm font-semibold text-slate-800 hover:opacity-80">Events App</a>
          {/* Center icon nav (visible on md+); footer nav on mobile */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 text-sm">
            <a
              href="/create"
              className={`relative group ${pathname === "/create" ? "text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
              aria-label="New Event"
              aria-current={pathname === "/create" ? "page" : undefined}
            >
              <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-7 w-7 transition-transform duration-150 ease-out group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded bg-current transition ${pathname === "/create" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
              <span className="sr-only">New Event</span>
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100 group-hover:translate-y-0">
                New Event
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-800" />
              </span>
            </a>
            <a
              href="/events"
              className={`relative group ${pathname === "/events" ? "text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
              aria-label="Upcoming Events"
              aria-current={pathname === "/events" ? "page" : undefined}
            >
              <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-7 w-7 transition-transform duration-150 ease-out group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v1.5M17.25 3v1.5M3 7.5h18M4.5 7.5V19.5A2.25 2.25 0 006.75 21h10.5A2.25 2.25 0 0019.5 19.5V7.5"/>
                <rect x="7.5" y="11" width="3" height="3" rx="0.5"/>
                <rect x="12.5" y="11" width="3" height="3" rx="0.5"/>
                <rect x="7.5" y="15" width="3" height="3" rx="0.5"/>
                <rect x="12.5" y="15" width="3" height="3" rx="0.5"/>
              </svg>
              <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded bg-current transition ${pathname === "/events" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
              <span className="sr-only">Upcoming Events</span>
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100 group-hover:translate-y-0">
                Upcoming Events
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-800" />
              </span>
            </a>
            <a
              href="/events/done"
              className={`relative group ${pathname?.startsWith("/events/done") ? "text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
              aria-label="Past Events"
              aria-current={pathname?.startsWith("/events/done") ? "page" : undefined}
            >
              <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-7 w-7 transition-transform duration-150 ease-out group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 100-20 10 10 0 000 20z"/>
              </svg>
              <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded bg-current transition ${pathname?.startsWith("/events/done") ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
              <span className="sr-only">Past Events</span>
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100 group-hover:translate-y-0">
                Past Events
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-800" />
              </span>
            </a>
            <a
              href="/expenses"
              className={`relative group ${pathname?.startsWith("/expenses") ? "text-rose-700" : "text-rose-600 hover:text-rose-700"}`}
              aria-label="Expenses"
              aria-current={pathname?.startsWith("/expenses") ? "page" : undefined}
            >
              <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-7 w-7 transition-transform duration-150 ease-out group-hover:scale-110">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m0 0l-3-3m3 3l3-3" />
              </svg>
              <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded bg-current transition ${pathname?.startsWith("/expenses") ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
              <span className="sr-only">Expenses</span>
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100 group-hover:translate-y-0">
                Expenses
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-800" />
              </span>
            </a>
            <a
              href="/income"
              className={`relative group ${pathname?.startsWith("/income") ? "text-emerald-700" : "text-emerald-600 hover:text-emerald-700"}`}
              aria-label="Income"
              aria-current={pathname?.startsWith("/income") ? "page" : undefined}
            >
              <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-7 w-7 transition-transform duration-150 ease-out group-hover:scale-110">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V8m0 0l-3 3m3-3l 3 3" />
              </svg>
              <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded bg-current transition ${pathname?.startsWith("/income") ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
              <span className="sr-only">Income</span>
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100 group-hover:translate-y-0">
                Income
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-800" />
              </span>
            </a>
            <a
              href="/stock"
              className={`relative group ${pathname?.startsWith("/stock") ? "text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
              aria-label="Stock"
              aria-current={pathname?.startsWith("/stock") ? "page" : undefined}
            >
              <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-7 w-7 transition-transform duration-150 ease-out group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-4.5-9 4.5 9 4.5 9-4.5z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5v9l9 4.5 9-4.5v-9"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v9"/>
              </svg>
              <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded bg-current transition ${pathname?.startsWith("/stock") ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
              <span className="sr-only">Stock</span>
              <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100 group-hover:translate-y-0">
                Stock
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-800" />
              </span>
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600">{name}</div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

