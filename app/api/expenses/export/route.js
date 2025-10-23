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

export async function GET(req) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start") || "";
  const end = url.searchParams.get("end") || "";
  const category = url.searchParams.get("category") || "";
  const format = (url.searchParams.get("format") || "csv").toLowerCase();
  const id = url.searchParams.get("id") || "";
  const anyPrisma = prisma;
  const gte = start ? new Date(start) : undefined;
  const lte = end ? new Date(end) : undefined;

  let rows = [];
  if (anyPrisma?.eventLedger?.findMany) {
    const where = { entry_type: "expense" };
    if (id) where.id = BigInt(id);
    if (gte || lte) where.entry_date = { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
    if (category) where.category = { contains: category, mode: "insensitive" };
    rows = await anyPrisma.eventLedger.findMany({
      where,
      include: { event: { select: { name: true } } },
      orderBy: { id: "desc" },
    });
  } else {
    if (id) {
      rows = await anyPrisma.$queryRaw`
        SELECT el.*, e.name AS event_name
        FROM event_ledger el
        JOIN events e ON e.id = el.event_id
        WHERE el.entry_type = 'expense' AND el.id = ${BigInt(id)}
        ORDER BY el.id DESC`;
    } else if (start && end && category) {
      rows = await anyPrisma.$queryRaw`
        SELECT el.*, e.name AS event_name
        FROM event_ledger el
        JOIN events e ON e.id = el.event_id
        WHERE el.entry_type = 'expense'
          AND el.entry_date BETWEEN ${new Date(start)} AND ${new Date(end)}
          AND el.category LIKE ${"%" + category + "%"}
        ORDER BY el.id DESC`;
    } else if (start && end) {
      rows = await anyPrisma.$queryRaw`
        SELECT el.*, e.name AS event_name
        FROM event_ledger el
        JOIN events e ON e.id = el.event_id
        WHERE el.entry_type = 'expense'
          AND el.entry_date BETWEEN ${new Date(start)} AND ${new Date(end)}
        ORDER BY el.id DESC`;
    } else if (start) {
      rows = await anyPrisma.$queryRaw`
        SELECT el.*, e.name AS event_name
        FROM event_ledger el
        JOIN events e ON e.id = el.event_id
        WHERE el.entry_type = 'expense'
          AND el.entry_date >= ${new Date(start)}
        ORDER BY el.id DESC`;
    } else if (end) {
      rows = await anyPrisma.$queryRaw`
        SELECT el.*, e.name AS event_name
        FROM event_ledger el
        JOIN events e ON e.id = el.event_id
        WHERE el.entry_type = 'expense'
          AND el.entry_date <= ${new Date(end)}
        ORDER BY el.id DESC`;
    } else if (category) {
      rows = await anyPrisma.$queryRaw`
        SELECT el.*, e.name AS event_name
        FROM event_ledger el
        JOIN events e ON e.id = el.event_id
        WHERE el.entry_type = 'expense'
          AND el.category LIKE ${"%" + category + "%"}
        ORDER BY el.id DESC`;
    } else {
      rows = await anyPrisma.$queryRaw`
        SELECT el.*, e.name AS event_name
        FROM event_ledger el
        JOIN events e ON e.id = el.event_id
        WHERE el.entry_type = 'expense'
        ORDER BY el.id DESC`;
    }
  }

  const header = [
    "Date",
    "Event",
    "Category",
    "Description",
    "Amount",
    "Currency",
    "Payment",
    "ID",
  ];
  const lines = [header.map(esc).join(",")];
  for (const x of rows) {
    const eventName = x?.event?.name ?? x?.event_name ?? "";
    lines.push([
      fmtDate(x.entry_date),
      eventName,
      x.category ?? "",
      x.description ?? "",
      x.amount ?? "",
      x.currency ?? "",
      x.payment_method ?? "",
      x.id ?? "",
    ].map(esc).join(","));
  }
  const csv = lines.join("\r\n");
  const baseName = `expenses-${start || 'all'}-${end || 'all'}`;

  if (format === 'excel' || format === 'xls') {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title></head><body><table border="1">${[header, ...rows].map((r, i) => {
      const cells = i === 0 ? header : [
        fmtDate(r.entry_date),
        (r?.event?.name ?? r?.event_name ?? ""),
        r.category ?? "",
        r.description ?? "",
        r.amount ?? "",
        r.currency ?? "",
        r.payment_method ?? "",
        
        r.id ?? "",
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
      <h1>Expenses report</h1>
      <p>Period: ${start || '—'} to ${end || '—'}${category ? `, Category: ${category}` : ''}</p>
      <table border="1">${[header, ...rows].map((r, i) => {
        const cells = i === 0 ? header : [
          fmtDate(r.entry_date),
          (r?.event?.name ?? r?.event_name ?? ""),
          r.category ?? "",
          r.description ?? "",
          r.amount ?? "",
          r.currency ?? "",
          r.payment_method ?? "",
          
          r.id ?? "",
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

