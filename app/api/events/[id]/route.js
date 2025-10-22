import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// BigInt -> string for JSON
const safe = (x) => JSON.parse(
  JSON.stringify(x, (_, v) => (typeof v === "bigint" ? v.toString() : v))
);

export async function PATCH(req, { params }) {
  const { id } = (await params) || {};
  const body = await req.json().catch(() => ({}));
  const status = body?.status ?? null;
  if (!id || !status) {
    return new Response(JSON.stringify({ error: "Missing id or status" }), { status: 400 });
  }
  const updated = await prisma.event.update({
    where: { id: BigInt(id) },
    data: { status },
  });
  return new Response(JSON.stringify(safe(updated)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
