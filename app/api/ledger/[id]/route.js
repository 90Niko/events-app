import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const safe = (x) => JSON.parse(
  JSON.stringify(x, (_, v) => (typeof v === "bigint" ? v.toString() : v))
);

export async function DELETE(req, { params }) {
  const { id } = (await params) || {};
  if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
  const bid = BigInt(id);
  try {
    const anyPrisma = prisma;
    if (anyPrisma?.eventLedger?.delete) {
      const deleted = await anyPrisma.eventLedger.delete({ where: { id: bid } });
      return new Response(JSON.stringify(safe(deleted)), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    // Fallback raw delete
    await (anyPrisma).$executeRaw`DELETE FROM event_ledger WHERE id = ${bid}`;
    return new Response(JSON.stringify({ id: id }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 400 });
  }
}

