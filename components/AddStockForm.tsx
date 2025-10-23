"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddStockForm({ users }: { users: string[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const form = e.currentTarget as HTMLFormElement;
    const f = new FormData(form);
    const priceNum = Number(f.get("price_per_kg") ?? 0);
    const weightNum = Number(f.get("weight_kg") ?? 0);
    const payload = {
      price_per_kg: priceNum,
      weight_kg: weightNum,
      purchase_date: f.get("purchase_date"),
      description: f.get("description") || null,
      purchased_by: f.get("purchased_by"),
      payment_method: f.get("payment_method"),
    } as any;

    if (!payload.price_per_kg && payload.price_per_kg !== 0 || !payload.weight_kg && payload.weight_kg !== 0 || !payload.purchase_date || !payload.purchased_by || !payload.payment_method) {
      setErr("Please fill all required fields.");
      return;
    }

    if (priceNum < 0 || weightNum <= 0) {
      setErr("Price must be >= 0 and weight > 0.");
      return;
    }

    try {
      setLoading(true);
      const req = fetch(`/api/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const delay = new Promise((r) => setTimeout(r, 800));
      const res = await Promise.all([req, delay]).then(([r]) => r as Response);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to save");
      }
      const j = await res.json().catch(() => ({}));
      const id = j?.id ?? j?.data?.id;
      form.reset();
      router.push(id ? `/stock?new=${encodeURIComponent(String(id))}` : "/stock");
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-6">
      <div>
        <label htmlFor="price_per_kg" className="text-xs font-medium text-slate-600">Price/kg (EUR)</label>
        <input id="price_per_kg" name="price_per_kg" type="number" step="0.01" min="0" required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label htmlFor="weight_kg" className="text-xs font-medium text-slate-600">Weight (kg)</label>
        <input id="weight_kg" name="weight_kg" type="number" step="0.001" min="0.001" required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label htmlFor="purchase_date" className="text-xs font-medium text-slate-600">Purchase date</label>
        <input id="purchase_date" name="purchase_date" type="date" required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm" />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="description" className="text-xs font-medium text-slate-600">Description</label>
        <input id="description" name="description" placeholder="short note (optional)" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label htmlFor="purchased_by" className="text-xs font-medium text-slate-600">Purchased by</label>
        <select id="purchased_by" name="purchased_by" required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm">
          <option value="">Select…</option>
          {users.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="payment_method" className="text-xs font-medium text-slate-600">Payment</label>
        <select id="payment_method" name="payment_method" required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm">
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank transfer</option>
        </select>
      </div>
      <div className="md:col-span-6 flex items-end gap-2 justify-end">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Add stock'}</button>
        {err ? <span className="text-sm text-rose-600">{err}</span> : null}
      </div>
    </form>
  );
}
