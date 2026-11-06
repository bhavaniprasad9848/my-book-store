"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

/** Admin-only panel for adding a new category shelf. */
export function AddCategoryForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    setError("");
    setDone("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: String(form.get("name") || ""), blurb: String(form.get("blurb") || "") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not add the category");
        return;
      }
      formEl.reset();
      setDone(`"${data.category.name}" was added. Its shelf is at the end of the page, ready for books.`);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="owner-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Categories</h2>
          <p className="text-sm text-ink-soft">Add a new shelf, then use the form at the end of that shelf to add its books.</p>
        </div>
        <button type="button" className="btn-secondary" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? "Close" : "Add a category"}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.75, 0.25, 1] }}
            style={{ overflow: "hidden" }}
          >
            <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
              <label className="grid gap-1 text-sm">
                Name
                <input className="input" name="name" required minLength={2} maxLength={40} placeholder="Poetry Books" />
              </label>
              <label className="grid gap-1 text-sm">
                Short description
                <input className="input" name="blurb" required minLength={5} maxLength={140} placeholder="Collections and anthologies to read aloud." />
              </label>
              <button className="btn-primary" type="submit" disabled={busy}>
                {busy ? "Adding..." : "Add category"}
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {error ? <p className="mt-3 text-sm text-red-700" role="alert">{error}</p> : null}
      {done ? <p className="mt-3 text-sm text-forest" role="status">{done}</p> : null}
    </section>
  );
}
