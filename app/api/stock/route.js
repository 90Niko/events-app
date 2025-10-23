import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const safe = (x) => JSON.parse(
  JSON.stringify(x, (_, v) => (typeof v === "bigint" ? v.toString() : v))
);

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  try {
    // Basic validation
    const price = b?.price_per_kg;
    const weight = b?.weight_kg;
    const date = b?.purchase_date;
    const purchasedBy = b?.purchased_by;
    const payment = b?.payment_method;
    const priceNum = Number(price);
    const weightNum = Number(weight);
    if (!price && price !== 0 || !weight && weight !== 0 || !date || !purchasedBy || !payment) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    if (Number.isNaN(priceNum) || Number.isNaN(weightNum) || priceNum < 0 || weightNum <= 0) {
      return new Response(JSON.stringify({ error: "Invalid price/weight values" }), { status: 400 });
    }

    const anyPrisma = prisma;
    if (anyPrisma?.stock?.create) {
      const created = await anyPrisma.stock.create({
        data: {
          price_per_kg: priceNum,
          weight_kg: weightNum,
          purchase_date: new Date(date),
          description: b?.description ?? null,
          purchased_by: purchasedBy,
          payment_method: payment,
        },
      });
      return new Response(JSON.stringify(safe(created)), { status: 201, headers: { "Content-Type": "application/json" } });
    }

    // Fallback raw insert if no Prisma model is present
    await anyPrisma.$executeRaw`INSERT INTO stock (price_per_kg, weight_kg, purchase_date, description, purchased_by, payment_method)
      VALUES (${price}, ${weight}, ${new Date(date)}, ${b?.description ?? null}, ${purchasedBy}, ${payment})`;
    const inserted = await anyPrisma.$queryRaw`SELECT LAST_INSERT_ID() AS id`;
    const idRow = Array.isArray(inserted) ? inserted[0] : inserted;
    return new Response(JSON.stringify(safe({ id: idRow?.id })), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 400 });
  }
}
