import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const safe = (x) => JSON.parse(
  JSON.stringify(x, (_, v) => (typeof v === "bigint" ? v.toString() : v))
);

// Company expenses: store in EventLedger under a hidden "Company" event.
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  try {
    const amountNum = Number(b?.amount ?? 0);
    if (Number.isNaN(amountNum) || amountNum < 0) {
      return new Response(JSON.stringify({ error: "Amount must be non-negative" }), { status: 400 });
    }
    // Find or create the special Company event
    let company = await prisma.event.findFirst({ where: { name: "Company", owner: "Company" } });
    if (!company) {
      company = await prisma.event.create({
        data: {
          name: "Company",
          owner: "Company",
          status: "done",
        },
      });
    }
    const anyPrisma = prisma;
    if (anyPrisma?.eventLedger?.create) {
      const created = await anyPrisma.eventLedger.create({
        data: {
          event_id: company.id,
          entry_type: "expense",
          category: b.category ?? null,
          description: b.description ?? null,
          amount: amountNum,
          currency: b.currency ?? "EUR",
          entry_date: b.entry_date ? new Date(b.entry_date) : new Date(),
          payment_method: b.payment_method ?? null,
        },
      });
      return new Response(JSON.stringify(safe(created)), { status: 201, headers: { "Content-Type": "application/json" } });
    }
    // Fallback raw insert when Prisma client lacks EventLedger model
    await (anyPrisma).$executeRaw`INSERT INTO event_ledger (event_id, entry_type, category, description, amount, currency, entry_date, payment_method)
      VALUES (${company.id}, 'expense', ${b.category ?? null}, ${b.description ?? null}, ${amountNum}, ${b.currency ?? 'EUR'}, ${b.entry_date ? new Date(b.entry_date) : new Date()}, ${b.payment_method ?? null})`;
    const inserted = await (anyPrisma).$queryRaw`SELECT LAST_INSERT_ID() AS id`;
    const idRow = Array.isArray(inserted) ? inserted[0] : inserted;
    const payload = { id: idRow?.id };
    return new Response(JSON.stringify(safe(payload)), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 400 });
  }
}
