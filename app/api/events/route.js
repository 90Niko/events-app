import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// BigInt -> string за JSON
const safe = (x) =>
  JSON.parse(JSON.stringify(x, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

export async function POST(req) {
  const b = await req.json();
  const created = await prisma.event.create({
    data: {
      name: b.name,
      owner: b.owner,
      description: b.description ?? null,
      venue_name: b.venue_name ?? null,
      address_line1: b.address_line1 ?? null,
      city: b.city ?? null,
      country: b.country ?? null,
      event_date: b.event_date ? new Date(b.event_date) : null, // "YYYY-MM-DD"
      start_time: b.start_time ? new Date(`1970-01-01T${b.start_time}:00`) : null, // "HH:mm"
      end_time: b.end_time ? new Date(`1970-01-01T${b.end_time}:00`) : null,
      timezone: b.timezone ?? null,
      reservation_deadline_date: b.reservation_deadline_date ? new Date(b.reservation_deadline_date) : null,
      status: b.status ?? null,
      url_address: b.url_address ?? null, // ✅ добавено поле
    },
  });

  return new Response(JSON.stringify(safe(created)), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
