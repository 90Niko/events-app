import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const safe = (x) => JSON.parse(
  JSON.stringify(x, (_, v) => (typeof v === "bigint" ? v.toString() : v))
);

export async function GET(req, { params }) {
  const { id } = (await params) || {};
  if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
  const bid = BigInt(id);
  const anyPrisma = prisma;
  const rows = anyPrisma?.eventLedger?.findMany
    ? await anyPrisma.eventLedger.findMany({ where: { event_id: bid }, orderBy: { entry_date: "desc" } })
    : await anyPrisma.$queryRaw`SELECT id, event_id, entry_type, category, description, amount, currency, entry_date, payment_method, created_at, updated_at FROM event_ledger WHERE event_id = ${bid} ORDER BY entry_date DESC`;
  return new Response(JSON.stringify(safe(rows)), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function POST(req, { params }) {
  const { id } = (await params) || {};
  if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
  const bid = BigInt(id);
  const b = await req.json().catch(() => ({}));
  try {
    const amountNum = Number(b?.amount ?? 0);
    if (Number.isNaN(amountNum) || amountNum < 0) {
      return new Response(JSON.stringify({ error: "Amount must be non-negative" }), { status: 400 });
    }
    const anyPrisma = prisma;
    if (anyPrisma?.eventLedger?.create) {
      const created = await anyPrisma.eventLedger.create({
        data: {
          event_id: bid,
          entry_type: b.entry_type,
          category: b.category ?? null,
          description: b.description ?? null,
          amount: amountNum,
          currency: b.currency ?? 'EUR',
          entry_date: b.entry_date ? new Date(b.entry_date) : new Date(),
          payment_method: b.payment_method ?? null,
        },
      });
      return new Response(JSON.stringify(safe(created)), { status: 201, headers: { "Content-Type": "application/json" } });
    }
    // Fallback raw insert + fetch last insert id
    await anyPrisma.$executeRaw`INSERT INTO event_ledger (event_id, entry_type, category, description, amount, currency, entry_date, payment_method)
      VALUES (${bid}, ${b.entry_type}, ${b.category ?? null}, ${b.description ?? null}, ${amountNum}, ${b.currency ?? 'EUR'}, ${b.entry_date ? new Date(b.entry_date) : new Date()}, ${b.payment_method ?? null})`;
    const inserted = await anyPrisma.$queryRaw`SELECT LAST_INSERT_ID() AS id`;
    const idRow = Array.isArray(inserted) ? inserted[0] : inserted;
    const payload = { id: idRow?.id };
    return new Response(JSON.stringify(safe(payload)), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 400 });
  }
}

