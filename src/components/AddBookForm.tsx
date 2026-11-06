"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AddBookForm({ category }: { category: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      category,
      title: String(form.get("title") || ""),
      author: String(form.get("author") || ""),
      description: String(form.get("description") || ""),
      condition: String(form.get("condition") || "Very Good"),
      pages: Number(form.get("pages")),
      price: Number(form.get("price")),
      stock: Number(form.get("stock") || 5),
    };

    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not add book");
      return;
    }
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <section className="panel mt-5 p-5">
      <h3 className="font-display text-xl">Add a new book</h3>
      <p className="mt-1 text-sm text-ink-soft">Add a book to this shelf. It goes on sale right away.</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Title
          <input className="input" name="title" required />
        </label>
        <label className="grid gap-1 text-sm">
          Author
          <input className="input" name="author" required />
        </label>
        <label className="grid gap-1 text-sm">
          Price ($)
          <input className="input" name="price" type="number" min="0.5" step="0.01" required />
        </label>
        <label className="grid gap-1 text-sm">
          Pages
          <input className="input" name="pages" type="number" min="1" required />
        </label>
        <label className="grid gap-1 text-sm">
          Condition
          <select className="input" name="condition" defaultValue="Very Good">
            <option>Like New</option>
            <option>Very Good</option>
            <option>Good</option>
            <option>Fair</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Stock
          <input className="input" name="stock" type="number" min="1" defaultValue={5} required />
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          Description
          <input className="input" name="description" required />
        </label>
        {error ? <p className="md:col-span-2 text-sm text-red-700">{error}</p> : null}
        <button className="btn-primary md:col-span-2" type="submit" disabled={busy}>
          {busy ? "Saving..." : "Add book to catalog"}
        </button>
      </form>
    </section>
  );
}
