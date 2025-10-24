import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function esc(v) {
  const s = v == null ? "" : String(v);
  return '"' + s.replaceAll('"', '""') + '"';
}

function fmtDate(d) {
  try {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function toNum(v) {
  return Number((v?.toString?.() ?? v) ?? 0);
}

function parseUnit(desc) {
  const s = (desc?.toString?.() ?? '').toString();
  const m = s.match(/\[unit:(kg|pcs)\]/i);
  return (m?.[1]?.toLowerCase?.()) === 'pcs' ? 'pcs' : 'kg';
}

function stripUnit(desc) {
  const s = (desc?.toString?.() ?? '').toString();
  return s.replace(/\s*\[unit:(kg|pcs)\]\s*/i, '').trim();
}

export async function GET(req) {
  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "csv").toLowerCase();
  const id = url.searchParams.get("id") || "";
  const anyPrisma = prisma;

  let rows = [];
  if (anyPrisma?.stock?.findMany) {
    const where = {};
    if (id) where.id = BigInt(id);
    rows = await anyPrisma.stock.findMany({ where, orderBy: { id: "desc" } });
  } else {
    if (id) {
      rows = await anyPrisma.$queryRaw`SELECT * FROM stock WHERE id = ${BigInt(id)} ORDER BY id DESC`;
    } else {
      rows = await anyPrisma.$queryRaw`SELECT * FROM stock ORDER BY id DESC`;
    }
  }

  const header = [
    "Date",
    "Purchased by",
    "Payment",
    "Price (EUR/unit)",
    "Quantity",
    "Unit",
    "Total (EUR)",
    "Description",
    "ID",
  ];

  const lines = [header.map(esc).join(",")];
  for (const x of rows) {
    const unit = parseUnit(x.description);
    const qty = unit === 'kg' ? toNum(x.weight_kg).toFixed(3) : toNum(x.weight_kg).toFixed(0);
    const price = toNum(x.price_per_kg).toFixed(2);
    const total = (toNum(x.price_per_kg) * toNum(x.weight_kg)).toFixed(2);
    lines.push([
      fmtDate(x.purchase_date),
      x.purchased_by ?? "",
      x.payment_method ?? "",
      price,
      qty,
      unit,
      total,
      stripUnit(x.description) ?? "",
      x.id ?? "",
    ].map(esc).join(","));
  }
  const csv = lines.join("\r\n");
  const baseName = `stock-${id || 'all'}`;

  if (format === 'excel' || format === 'xls') {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title></head><body><table border="1">${[header, ...rows].map((r, i) => {
      const unit = i === 0 ? '' : parseUnit(r.description);
      const qty = i === 0 ? '' : (unit === 'kg' ? toNum(r.weight_kg).toFixed(3) : toNum(r.weight_kg).toFixed(0));
      const price = i === 0 ? '' : toNum(r.price_per_kg).toFixed(2);
      const total = i === 0 ? '' : (toNum(r.price_per_kg) * toNum(r.weight_kg)).toFixed(2);
      const cells = i === 0 ? header : [
        fmtDate(r.purchase_date),
        r.purchased_by ?? '',
        r.payment_method ?? '',
        price,
        qty,
        unit,
        total,
        stripUnit(r.description) ?? '',
        r.id ?? '',
      ];
      const tag = i === 0 ? 'th' : 'td';
      return `<tr>${cells.map(c => `<${tag}>${String(c ?? '')}</${tag}>`).join('')}</tr>`;
    }).join('')}</table></body></html>`;
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"${baseName}.xls\"`,
      },
    });
  }

  if (format === 'word' || format === 'doc') {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title></head><body>
      <h1>Stock export</h1>
      <table border="1">${[header, ...rows].map((r, i) => {
        const unit = i === 0 ? '' : parseUnit(r.description);
        const qty = i === 0 ? '' : (unit === 'kg' ? toNum(r.weight_kg).toFixed(3) : toNum(r.weight_kg).toFixed(0));
        const price = i === 0 ? '' : toNum(r.price_per_kg).toFixed(2);
        const total = i === 0 ? '' : (toNum(r.price_per_kg) * toNum(r.weight_kg)).toFixed(2);
        const cells = i === 0 ? header : [
          fmtDate(r.purchase_date),
          r.purchased_by ?? '',
          r.payment_method ?? '',
          price,
          qty,
          unit,
          total,
          stripUnit(r.description) ?? '',
          r.id ?? '',
        ];
        const tag = i === 0 ? 'th' : 'td';
        return `<tr>${cells.map(c => `<${tag}>${String(c ?? '')}</${tag}>`).join('')}</tr>`;
      }).join('')}</table>
    </body></html>`;
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "application/msword; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"${baseName}.doc\"`,
      },
    });
  }

  const filename = `${baseName}.csv`;
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
    },
  });
}

