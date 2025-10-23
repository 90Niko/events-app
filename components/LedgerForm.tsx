"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LedgerForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<"income" | "expense">("income");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const formEl = e.currentTarget as HTMLFormElement;
    const f = new FormData(formEl);
    const payload = {
      entry_type: f.get("entry_type"),
      category: f.get("category") || null,
      description: f.get("description") || null,
      amount: Number(f.get("amount") ?? 0),
      currency: f.get("currency") || "EUR",
      payment_method: f.get("payment_method") || null,
      counterparty: f.get("counterparty") || null,
    } as any;
    if (Number.isNaN(payload.amount) || payload.amount < 0) {
      setErr("Amount must be non-negative.");
      return;
    }
    try {
      setLoading(true);
      const req = fetch(`/api/events/${eventId}/ledger`, {
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
      formEl?.reset();
      router.push("/events/done");
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-6">
      <div className="md:col-span-1">
        <label className="text-xs font-medium text-slate-600" htmlFor="entry_type">Type</label>
        <select
          id="entry_type"
          name="entry_type"
          value={entryType}
          onChange={(e) => setEntryType(e.currentTarget.value as any)}
          className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <div className="md:col-span-1">
        <label className="text-xs font-medium text-slate-600" htmlFor="category">Category</label>
        {entryType === "expense" ? (
          <select id="category" name="category" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm">
            <option value="">Select category…</option>
            <option value="Food">Food</option>
            <option value="Fuel">Fuel</option>
            <option value="Rent">Rent</option>
            <option value="Other">Other</option>
          </select>
        ) : (
          <select id="category" name="category" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm">
            <option value="">Select category…</option>
            <option value="Mystery box">Mystery box</option>
            <option value="Online">Online</option>
            <option value="Event">Event</option>
          </select>
        )}
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-medium text-slate-600" htmlFor="description">Description</label>
        <input id="description" name="description" placeholder="short note" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm" />
      </div>
      <div className="md:col-span-1">
        <label className="text-xs font-medium text-slate-600" htmlFor="amount">Amount</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0" required className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm" />
      </div>
      <div className="md:col-span-1">
        <label className="text-xs font-medium text-slate-600" htmlFor="currency">Currency</label>
        <input id="currency" name="currency" defaultValue="EUR" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm" />
      </div>
      {/* Date is set automatically to today on the server */}
      <div className="md:col-span-2">
        <label className="text-xs font-medium text-slate-600" htmlFor="payment_method">Payment</label>
        <select id="payment_method" name="payment_method" defaultValue="cash" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm">
          <option value="cash">Cash</option>
          <option value="card">Card</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-medium text-slate-600" htmlFor="counterparty">Counterparty</label>
        <input id="counterparty" name="counterparty" placeholder="vendor/client" className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm" />
      </div>
      <div className="md:col-span-6 flex items-end gap-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Add entry'}</button>
        {err ? <span className="text-sm text-rose-600">{err}</span> : null}
      </div>
    </form>
  );
}
