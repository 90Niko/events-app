"use client";

import { usePathname } from "next/navigation";

export default function MobileFooterNav() {
  const pathname = usePathname();
  if (pathname === "/") return null; // hide on sign-in
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200 bg-white/80 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-around px-4 text-sm">
        <a
          href="/create"
          className={`relative group ${pathname === "/create" ? "text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
          aria-label="New Event"
          aria-current={pathname === "/create" ? "page" : undefined}
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded bg-current origin-center transition-all duration-200 ease-out ${pathname === "/create" ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
          <span className="sr-only">New Event</span>
        </a>
        <a
          href="/events"
          className={`relative group ${pathname === "/events" ? "text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
          aria-label="Upcoming Events"
          aria-current={pathname === "/events" ? "page" : undefined}
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v1.5M17.25 3v1.5M3 7.5h18M4.5 7.5V19.5A2.25 2.25 0 006.75 21h10.5A2.25 2.25 0 0019.5 19.5V7.5"/>
            <rect x="7.5" y="11" width="3" height="3" rx="0.5"/>
            <rect x="12.5" y="11" width="3" height="3" rx="0.5"/>
            <rect x="7.5" y="15" width="3" height="3" rx="0.5"/>
            <rect x="12.5" y="15" width="3" height="3" rx="0.5"/>
          </svg>
          <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded bg-current origin-center transition-all duration-200 ease-out ${pathname === "/events" ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
          <span className="sr-only">Upcoming Events</span>
        </a>
        <a
          href="/events/done"
          className={`relative group ${pathname?.startsWith("/events/done") ? "text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
          aria-label="Past Events"
          aria-current={pathname?.startsWith("/events/done") ? "page" : undefined}
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 100-20 10 10 0 000 20z"/>
          </svg>
          <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded bg-current origin-center transition-all duration-200 ease-out ${pathname?.startsWith("/events/done") ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
          <span className="sr-only">Past Events</span>
        </a>
        <a
          href="/expenses"
          className={`relative group ${pathname?.startsWith("/expenses") ? "text-rose-700" : "text-rose-600 hover:text-rose-700"}`}
          aria-label="Expenses"
          aria-current={pathname?.startsWith("/expenses") ? "page" : undefined}
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-8 w-8">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m0 0l-3-3m3 3l3-3" />
          </svg>
          <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded bg-current origin-center transition-all duration-200 ease-out ${pathname?.startsWith("/expenses") ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
          <span className="sr-only">Expenses</span>
        </a>
        <a
          href="/income"
          className={`relative group ${pathname?.startsWith("/income") ? "text-emerald-700" : "text-emerald-600 hover:text-emerald-700"}`}
          aria-label="Income"
          aria-current={pathname?.startsWith("/income") ? "page" : undefined}
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-8 w-8">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V8m0 0l-3 3m3-3l3 3" />
          </svg>
          <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded bg-current origin-center transition-all duration-200 ease-out ${pathname?.startsWith("/income") ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
          <span className="sr-only">Income</span>
        </a>
        <a
          href="/stock"
          className={`relative group ${pathname?.startsWith("/stock") ? "text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
          aria-label="Stock"
          aria-current={pathname?.startsWith("/stock") ? "page" : undefined}
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-4.5-9 4.5 9 4.5 9-4.5z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5v9l9 4.5 9-4.5v-9"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v9"/>
          </svg>
          <span className={`pointer-events-none absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded bg-current origin-center transition-all duration-200 ease-out ${pathname?.startsWith("/stock") ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
          <span className="sr-only">Stock</span>
        </a>
      </div>
    </div>
  );
}
