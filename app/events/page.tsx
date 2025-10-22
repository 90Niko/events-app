import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import MarkDoneButton from "@/components/MarkDoneButton";

export const dynamic = "force-dynamic";

type Search = { [k: string]: string | string[] | undefined };

async function getEvents(filters: { name?: string; city?: string; date?: string }) {
  const where: any = { OR: [{ status: "upcoming" }, { status: null }] };
  if (filters.name) where.name = { contains: filters.name, mode: "insensitive" };
  if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
  if (filters.date) {
    const d = new Date(filters.date);
    if (!isNaN(d.getTime())) {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.event_date = { gte: start, lt: end };
    }
  }
  const rows = await prisma.event.findMany({ where, orderBy: { id: "desc" } });
  return rows as any[];
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const name = typeof sp?.name === "string" ? sp.name : "";
  const city = typeof sp?.city === "string" ? sp.city : "";
  const date = typeof sp?.date === "string" ? sp.date : "";
  const highlightId = typeof sp?.new === "string" ? sp.new : "";
  const events = await getEvents({ name, city, date });

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-white relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.200)_1px,transparent_1px)] [background-size:24px_24px] opacity-[.35]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-10">
        <header className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
                Events
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">All events</h1>
              <p className="mt-1 text-slate-500 text-sm">Listing {events.length} entr{events.length === 1 ? "y" : "ies"}.</p>
            </div>
            <div className="flex items-center gap-2">
              <a href="/events/done" className="text-sm text-slate-600 underline hover:text-slate-800">Done</a>
              <a href="/create" className="text-sm text-slate-600 underline hover:text-slate-800">Create</a>
            </div>
          </div>

          <form className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur md:grid-cols-4" method="get">
            <div>
              <label htmlFor="name" className="text-xs font-medium text-slate-600">Name</label>
              <input id="name" name="name" defaultValue={name} placeholder="Search name" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100" />
            </div>
            <div>
              <label htmlFor="city" className="text-xs font-medium text-slate-600">City</label>
              <input id="city" name="city" defaultValue={city} placeholder="Search city" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100" />
            </div>
            <div>
              <label htmlFor="date" className="text-xs font-medium text-slate-600">Date</label>
              <input id="date" name="date" type="date" defaultValue={date} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary">Filter</button>
              <a href="/events" className="btn-outline">Clear</a>
            </div>
          </form>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Name</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Owner</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">When</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">City</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Deadline</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Status</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Link</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {events.map((e: any) => {
                  const eventDate = e.event_date ? new Date(e.event_date) : null;
                  const startTime = e.start_time ? new Date(e.start_time) : null;
                  const endDate = e.end_date ? new Date(e.end_date) : null;
                  const deadline = e.reservation_deadline_date ? new Date(e.reservation_deadline_date) : null;

                  const startPart = eventDate
                    ? `${format(eventDate, "dd MMM yyyy")}${startTime ? ` ${format(startTime, "HH:mm")}` : ""}`
                    : startTime
                    ? format(startTime, "HH:mm")
                    : "-";
                  const endPart = endDate ? format(endDate, "dd MMM yyyy") : "";
                  const whenStr = endPart ? `${startPart} - ${endPart}` : startPart;

                  const rawUrl = (e.url_address ?? e.url_adress ?? "").toString().trim();
                  const href = rawUrl
                    ? (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`)
                    : "";

                  const isNew = highlightId && String(e.id ?? "") === String(highlightId);
                  return (
                    <tr
                      key={String(e.id ?? `${e.name}-${e.owner}-${e.event_date ?? Math.random()}`)}
                      className={`hover:bg-slate-50/60 ${isNew ? "bg-emerald-50 ring-2 ring-emerald-300" : ""}`}
                    >
                      <td className="px-3 py-2 sm:px-4 sm:py-3 font-medium text-slate-800">{e.name ?? "-"}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{e.owner ?? "-"}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{whenStr}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{e.city ?? "-"}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-slate-700">{deadline ? format(deadline, "dd MMM yyyy") : "-"}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600">{e.status ?? "-"}</span>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        {href ? (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-700 hover:bg-slate-50" title={href}>
                            Open
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        {e.id != null ? <MarkDoneButton id={e.id} /> : null}
                      </td>
                    </tr>
                  );
                })}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No events yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
