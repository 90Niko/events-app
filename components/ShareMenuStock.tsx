"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ShareMenuStock() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyLink() {
    try {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = url; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 1200); } finally { document.body.removeChild(ta); }
      });
    } catch {}
  }

  function doPrint() {
    try { window.print(); } catch {}
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
            <button type="button" className="btn-outline justify-start" onClick={copyLink}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M3 16a5 5 0 005 5h3v-2H8a3 3 0 110-6h3v-2H8a5 5 0 00-5 5zm8-7V7H8a3 3 0 000 6h3v-2H8a1 1 0 110-2h3zm3-2h-3v2h3a1 1 0 010 2h-3v2h3a3 3 0 000-6z"/></svg>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button type="button" className="btn-outline justify-start" onClick={doPrint}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M6 9V3h12v6h1a3 3 0 013 3v5h-4v4H6v-4H2v-5a3 3 0 013-3h1zm2-4v4h8V5H8zm8 12H8v2h8v-2z"/></svg>
              Print
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
