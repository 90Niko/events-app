"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddCompanyExpenseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const form = e.currentTarget as HTMLFormElement;
    const f = new FormData(form);
    const amountNum = Number(f.get("amount") ?? 0);
    const payload = {
      entry_type: "expense",
      category: f.get("category") || null,
      description: f.get("description") || null,
      amount: amountNum,
      payment_method: f.get("payment_method") || null,
    } as any;
    if (amountNum < 0) {
      setErr("Amount must be non-negative.");
      return;
    }
    try {
      setLoading(true);
      const req = fetch(`/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const delay = new Promise((r) => setTimeout(r, 1500));
      const res = await Promise.all([req, delay]).then(([r]) => r as Response);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to save");
      }
      const j = await res.json().catch(() => ({}));
      const id = j?.id ?? j?.data?.id;
      form.reset();
      router.push(id ? `/expenses?new=${encodeURIComponent(String(id))}` : "/expenses");
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-6">
      <div>
        <label className="text-xs font-medium text-slate-600" htmlFor="category">Category</label>
        <select id="category" name="category" required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm">
          <option value="">Select category…</option>
          <option value="Food">Food</option>
          <option value="Fuel">Fuel</option>
          <option value="Rent">Rent</option>
          <option value="Salary">Salary</option>
          <option value="Stock">Stock</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-medium text-slate-600" htmlFor="description">Description</label>
        <input id="description" name="description" placeholder="short note" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600" htmlFor="amount">Amount</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0" required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm" />
      </div>
      
      <div>
        <label className="text-xs font-medium text-slate-600" htmlFor="payment_method">Payment</label>
        <select id="payment_method" name="payment_method" defaultValue="cash" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm">
          <option value="cash">Cash</option>
          <option value="card">Card</option>
        </select>
      </div>
      
      <div className="md:col-span-6 flex items-end gap-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Add expense'}</button>
        {err ? <span className="text-sm text-rose-600">{err}</span> : null}
      </div>
    </form>
  );
}

