"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ShareMenuStockRow({
  id,
  date,
  purchasedBy,
  paymentMethod,
  desc,
  price,
  qty,
  unit,
  total,
}: {
  id: string | number;
  date?: string;
  purchasedBy?: string;
  paymentMethod?: string;
  desc?: string;
  price: number;
  qty: number;
  unit: 'kg' | 'pcs';
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const dateStr = date ? date : '-';
  const priceStr = `${Number(price).toFixed(2)} EUR/${unit}`;
  const qtyStr = unit === 'kg' ? `${Number(qty).toFixed(3)} kg` : `${Number(qty).toFixed(0)} pcs`;
  const totalStr = `${Number(total).toFixed(2)} EUR`;
  const descStr = (desc ?? '').toString();

  function copySummary() {
    const summary = `Stock #${id}: ${dateStr}, ${purchasedBy ?? '-'}, ${paymentMethod ?? '-'}, ${qtyStr} @ ${priceStr}, Total ${totalStr}${descStr ? ` – ${descStr}` : ''}`;
    try {
      navigator.clipboard.writeText(summary).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = summary; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 1200); } finally { document.body.removeChild(ta); }
      });
    } catch {}
  }

  function copyLink() {
    try {
      const loc = window.location;
      const url = `${loc.origin}${loc.pathname}${loc.search}#stock-${id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  function Modal() {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Export / Print</h3>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-500 hover:text-slate-700" aria-label="Close">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M6.2 4.8L4.8 6.2 10.6 12l-5.8 5.8 1.4 1.4L12 13.4l5.8 5.8 1.4-1.4L13.4 12l5.8-5.8-1.4-1.4L12 10.6 6.2 4.8z"/></svg>
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <a className="btn-outline justify-start" href={`/api/stock/export?id=${id}&format=csv`} onClick={() => setOpen(false)}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M12 3v10.5l3.75-3.75 1.5 1.5L12 17.5 6.75 11.25l1.5-1.5L12 13.5V3z"/></svg>
              CSV
            </a>
            <a className="btn-outline justify-start" href={`/api/stock/export?id=${id}&format=excel`} onClick={() => setOpen(false)}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M5 3h9a3 3 0 013 3v1h2a2 2 0 012 2v10a2 2 0 01-2 2H7a3 3 0 01-3-3V5a2 2 0 012-2zm0 2v14a1 1 0 001 1h13V9a1 1 0 00-1-1h-2v2H7V5H6a1 1 0 00-1 1zm7.5 6l-1.8 3 1.8 3h-1.8l-1.2-2-1.2 2H7.5l1.8-3-1.8-3h1.8l1.2 2 1.2-2h1.8z"/></svg>
              Excel
            </a>
            <a className="btn-outline justify-start" href={`/api/stock/export?id=${id}&format=word`} onClick={() => setOpen(false)}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M4 4h9a3 3 0 013 3v1h2a2 2 0 012 2v9a2 2 0 01-2 2H7a3 3 0 01-3-3V6a2 2 0 012-2zm1 2v14a1 1 0 001 1h13V10a1 1 0 00-1-1h-2v2H7V6H5zm10.5 12l-1.2-5-1.2 4h-1.6l-1.2-4-1.2 5H7.3L9 9.5h1.6l1.2 4 1.2-4H14.6L16.3 18z"/></svg>
              Word
            </a>
            <a className="btn-outline justify-start" href={`/stock/print?id=${id}`} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M6 9V3h12v6h1a3 3 0 013 3v5h-4v4H6v-4H2v-5a3 3 0 013-3h1zm2-4v4h8V5H8zm8 12H8v2h8v-2z"/></svg>
              Print
            </a>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <button type="button" className="hidden btn-outline justify-start" onClick={copySummary}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M4 4h13a3 3 0 013 3v11a3 3 0 01-3 3H8a3 3 0 01-3-3V4zm2 2v12a1 1 0 001 1h11V7a1 1 0 00-1-1h-2v2H7V6H5z"/></svg>
              {copied ? 'Copied!' : 'Copy summary'}
            </button>
            <button type="button" className="hidden btn-outline justify-start" onClick={copyLink}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M3 16a5 5 0 005 5h3v-2H8a3 3 0 110-6h3v-2H8a1 1 0 110-2h3zm8-7V7H8a3 3 0 000 6h3v-2H8a1 1 0 110-2h3zm3-2h-3v2h3a1 1 0 010 2h-3v2h3a3 3 0 000-6z"/></svg>
              Copy link to row
            </button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="btn-outline inline-flex items-center gap-1" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-label="Export / Print">
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M15 8a3 3 0 11-2.83 4H9a3 3 0 110-2h3.17A3 3 0 0115 8zm0-5a2 2 0 110 4 2 2 0 010-4zM6 10a2 2 0 110 4 2 2 0 010-4zm9 7a2 2 0 110 4 2 2 0 010-4z"/></svg>
        <span className="hidden sm:inline">Export/Print</span>
      </button>
      {open ? createPortal(<Modal />, document.body) : null}
    </>
  );
}

