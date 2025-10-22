"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePage() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);

    const startDT = (f.get("start_datetime") as string | null)?.toString() || "";
    const endDT = (f.get("end_datetime") as string | null)?.toString() || "";
    const event_date = startDT.split("T")[0] || null;
    const start_time = startDT.split("T")[1] || null;
    const end_date = endDT.split("T")[0] || null;
    const end_time = endDT.split("T")[1] || null;

    const payload = {
      name: f.get("name"),
      owner: f.get("owner"),
      city: f.get("city"),
      country: f.get("country"),
      event_date,
      end_date,
      start_time,
      end_time,
      description: f.get("description"),
      address_line1: f.get("address_line1"),
      reservation_deadline_date: f.get("reservation_deadline_date"),
      url_address: f.get("url_address"),
    } as any;

    try {
      setSubmitting(true);
      setMsg(null);
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        const id = j?.id ?? j?.data?.id;
        // redirect to events and highlight the newly created one
        router.push(id ? `/events?new=${encodeURIComponent(String(id))}` : "/events");
        return;
      } else {
        setMsg({ type: "err", text: j?.error ? JSON.stringify(j.error) : "Something went wrong" });
      }
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message ?? "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-white relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.200)_1px,transparent_1px)] [background-size:24px_24px] opacity-[.35]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Event builder
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
              Create a new event
            </h1>
            <div className="flex items-center gap-2">
              <a href="/events" className="text-sm text-slate-600 underline hover:text-slate-800">Back to events</a>
            </div>
          </div>
          <p className="mt-1 text-slate-500">
            Fill in the details and click <span className="font-medium text-slate-700">Create event</span>. Required fields are marked.
          </p>
        </header>

        {msg && (
          <div
            role={msg.type === "err" ? "alert" : undefined}
            className={`mb-4 rounded-2xl border p-3 text-sm shadow-sm ${
              msg.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-200/50 backdrop-blur">
          <form onSubmit={onSubmit} className="p-5 md:p-8">
            <Section title="Basics" subtitle="Core information about your event." />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Event name" name="name" required placeholder="e.g., Autumn Flea Market" hint="Public name of the event." />
              <Field label="Organizer" name="owner" required placeholder="e.g., Naiko" hint="Who is responsible for this event." />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Event URL" name="url_address" type="url" required placeholder="https://example.com/my-event" hint="Public link to the event page." />
            </div>

            <Divider />
            <Section title="Date & time" subtitle="When your event takes place." />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="start_datetime">Start<span className="ml-1 text-rose-500" aria-hidden>*</span></Label>
                <input id="start_datetime" name="start_datetime" type="datetime-local" className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none shadow-sm placeholder:text-slate-400 ring-0 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100 transition" required />
                <p className="mt-1 text-xs text-slate-500">Select start date and time.</p>
              </div>
              <div>
                <Label htmlFor="end_datetime">End<span className="ml-1 text-rose-500" aria-hidden>*</span></Label>
                <input id="end_datetime" name="end_datetime" type="datetime-local" className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none shadow-sm placeholder:text-slate-400 ring-0 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100 transition" required />
                <p className="mt-1 text-xs text-slate-500">Select end date and time.</p>
              </div>
            </div>

            <Divider />
            <Section title="Location" subtitle="Where attendees should go." />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Address" name="address_line1" placeholder="Main St. 10" />
              <Field label="City" name="city" placeholder="Munich" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Country" name="country" placeholder="DE" />
              <Field label="Reservation deadline" name="reservation_deadline_date" type="date" />
            </div>

            <Divider />
            <Section title="Description" subtitle="What attendees should know." />
            <div className="mt-4">
              <FieldTextarea label="Description" name="description" placeholder="Short description, rules, what to bring, etc." hint="Markdown supported in some UIs." />
            </div>

            <Divider />
            <div className="mt-6 flex items-center justify-end">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? (<><Spinner /><span>Saving…</span></>) : (<span>Create event</span>)}
              </button>
            </div>
          </form>
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}

function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="text-sm font-medium text-slate-700" {...props} />
  );
}

function Section({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mt-2">
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function Divider() {
  return (
    <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}{required ? <span className="ml-1 text-rose-500" aria-hidden>*</span> : null}</Label>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      <input id={name} name={name} type={type} required={required} placeholder={placeholder} className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none shadow-sm placeholder:text-slate-400 ring-0 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100 transition" />
    </div>
  );
}

function FieldTextarea({ label, name, placeholder, hint }: { label: string; name: string; placeholder?: string; hint?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      <textarea id={name} name={name} placeholder={placeholder} rows={4} className="mt-1 block w-full resize-y rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none shadow-sm placeholder:text-slate-400 ring-0 focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-slate-100 transition" />
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" />
    </svg>
  );
}
