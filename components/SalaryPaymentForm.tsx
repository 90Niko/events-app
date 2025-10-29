"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SalaryPaymentForm() {
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
      employee: (f.get("employee") || "").toString().trim() || null,
      description: f.get("description") || null,
      amount: amountNum,
      payment_method: f.get("payment_method") || null,
      entry_date: f.get("entry_date") || null,
    } as any;
    if (Number.isNaN(amountNum) || amountNum < 0) {
      setErr("Amount must be non-negative.");
      return;
    }
    try {
      setLoading(true);
      const req = fetch(`/api/salaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const delay = new Promise((r) => setTimeout(r, 1200));
      const res = await Promise.all([req, delay]).then(([r]) => r as Response);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to save");
      }
      const j = await res.json().catch(() => ({}));
      const id = j?.id ?? j?.data?.id;
      form.reset();
      router.push(id ? `/stock?salary_new=${encodeURIComponent(String(id))}` : "/stock");
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-6">
      <div className="md:col-span-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-600">
          Record a salary payment to Company ledger. Required fields are marked with *.
        </div>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="employee" className="text-xs font-medium text-slate-700">Employee</label>
        <input
          id="employee"
          name="employee"
          placeholder="e.g. Ivan Petrov (optional)"
          className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm placeholder:text-slate-400 ring-0 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100 transition"
        />
        <p className="mt-1 text-[11px] text-slate-400">Used as counterparty in the ledger.</p>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="description" className="text-xs font-medium text-slate-700">Description</label>
        <input
          id="description"
          name="description"
          placeholder="e.g. August 2025 salary (optional)"
          className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm placeholder:text-slate-400 ring-0 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100 transition"
        />
      </div>

      <div>
        <label htmlFor="entry_date" className="text-xs font-medium text-slate-700">Paid on <span className="text-rose-600">*</span></label>
        <input
          id="entry_date"
          name="entry_date"
          type="date"
          required
          className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm ring-0 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100 transition"
        />
      </div>

      <div>
        <label htmlFor="amount" className="text-xs font-medium text-slate-700">Amount <span className="text-rose-600">*</span></label>
        <div className="mt-1 relative">
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            className="block w-full rounded-2xl border border-slate-200 bg-white pr-14 pl-3 py-2 text-sm text-slate-800 outline-none shadow-sm ring-0 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100 transition"
          />
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[11px] text-slate-500">EUR</span>
        </div>
      </div>

      <div>
        <label htmlFor="payment_method" className="text-xs font-medium text-slate-700">Payment <span className="text-rose-600">*</span></label>
        <select
          id="payment_method"
          name="payment_method"
          defaultValue="cash"
          className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none shadow-sm ring-0 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100 transition"
        >
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank transfer</option>
        </select>
      </div>

      <div className="md:col-span-6 flex items-end gap-3 justify-end">
        {err ? (
          <div aria-live="polite" className="mr-auto rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
            {err}
          </div>
        ) : null}
        <button type="submit" disabled={loading} className="btn-primary min-w-28">{loading ? 'Saving…' : 'Pay salary'}</button>
      </div>
    </form>
  );
}
