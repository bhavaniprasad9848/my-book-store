import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import { moneyFromCents } from "@/lib/catalog";
import { getSellerReport, LOW_STOCK } from "@/lib/sellerReport";

type Report = Awaited<ReturnType<typeof getSellerReport>>;

const STEP_LABEL: Record<string, string> = {
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

function Tile({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "warn" }) {
  return (
    <div className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className={`mt-2 font-display text-3xl tabular-nums ${tone === "warn" ? "text-[#9a3412]" : ""}`}>{value}</p>
      {note ? <p className="mt-1 text-sm text-ink-soft">{note}</p> : null}
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock < 1)
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">⛔ Sold out</span>;
  if (stock <= LOW_STOCK)
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">⚠ Low · {stock}</span>;
  return <span className="text-sm tabular-nums">{stock}</span>;
}

/** Stock and sales report. "store" = admin view of the whole shop, "seller" = one seller's own books. */
export function ReportDashboard({ report, sellerName }: { report: Report; sellerName?: string }) {
  const isStore = report.scope === "store";
  const { totals } = report;
  const maxDay = Math.max(1, ...report.daily.map((d) => d.cents));
  const fourteenDayCents = report.daily.reduce((s, d) => s + d.cents, 0);
  const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

  return (
    <>
      <Topbar />
      <main className="page pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="section-title">{isStore ? "Admin dashboard" : "Seller dashboard"}</h1>
            <p className="section-blurb">
              {isStore
                ? "The whole store at a glance: every seller, every book, every paid order."
                : `${sellerName ? `${sellerName}, here's` : "Here's"} how your own books are doing. Money is what your books earned from paid orders.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/shop" className="btn-primary">{isStore ? "+ Add books" : "+ List a book"}</Link>
            {isStore ? <Link href="/orders" className="btn-secondary">Manage orders</Link> : null}
          </div>
        </div>

        {!isStore && totals.titles === 0 ? (
          <div className="panel mb-8 p-6">
            <h2 className="font-display text-2xl">List your first book</h2>
            <p className="mt-2 text-ink-soft">
              Open the shop and use the form at the end of any shelf to add a book. It will show here with its stock and sales.
            </p>
            <Link href="/shop" className="btn-primary mt-4 inline-flex">+ List a book</Link>
          </div>
        ) : null}

        <h2 className="mb-3 font-display text-xl">Money</h2>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            label={isStore ? "Total earned" : "You earned"}
            value={moneyFromCents(totals.revenueCents)}
            note={isStore ? "Books + shipping, paid orders" : "From your books in paid orders"}
          />
          {isStore ? (
            <Tile label="Book sales" value={moneyFromCents(totals.bookSalesCents)} note={`Shipping collected ${moneyFromCents(totals.shippingCents)}`} />
          ) : (
            <Tile label="Titles listed" value={String(totals.titles)} note="Books you've put on the shelves" />
          )}
          <Tile
            label={isStore ? "Paid orders" : "Orders with your books"}
            value={String(totals.paidOrders)}
            note={[
              totals.cancelledOrders
                ? `${totals.cancelledOrders} cancelled (${moneyFromCents(totals.refundedCents)} refunded)`
                : "No cancellations",
              totals.pendingOrders ? `${totals.pendingOrders} unpaid` : "",
            ].filter(Boolean).join(" · ")}
          />
          <Tile label={isStore ? "Average order" : "Average per order"} value={moneyFromCents(totals.avgOrderCents)} />
        </section>

        <h2 className="mb-3 mt-8 font-display text-xl">Stock</h2>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Books sold" value={String(totals.unitsSold)} note="Copies across all paid orders" />
          <Tile label="Copies in stock" value={String(totals.unitsInStock)} note={`${totals.titles} titles on the shelves`} />
          <Tile label="Stock value" value={moneyFromCents(totals.stockValueCents)} note="Copies in stock × price" />
          <Tile
            label="Needs restock"
            value={String(totals.lowStock + totals.soldOut)}
            note={`${totals.soldOut} sold out · ${totals.lowStock} low (≤ ${LOW_STOCK})`}
            tone={totals.lowStock + totals.soldOut > 0 ? "warn" : undefined}
          />
        </section>

        <section className="panel mt-8 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl">Money earned per day</h2>
            <p className="text-sm text-ink-soft">Last 14 days · {moneyFromCents(fourteenDayCents)} total</p>
          </div>
          <div className="mt-6 flex h-48 items-end gap-[2px] border-b border-black/15" role="img" aria-label="Bar chart of money earned per day for the last 14 days. The table below has the same numbers.">
            {report.daily.map((d) => {
              const pct = d.cents ? Math.max(3, (d.cents / maxDay) * 100) : 0;
              const label = `${dayFmt.format(d.day)}: ${moneyFromCents(d.cents)} from ${d.orders} order${d.orders === 1 ? "" : "s"}`;
              return (
                <div key={d.day.toISOString()} className="group relative flex h-full flex-1 items-end justify-center" title={label}>
                  <div
                    className="w-full max-w-10 rounded-t-[4px] bg-forest transition-opacity group-hover:opacity-80"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-white group-hover:block">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex gap-[2px] text-[11px] text-ink-soft">
            {report.daily.map((d, i) => (
              <span key={d.day.toISOString()} className="flex-1 text-center">
                {i % 2 === 0 || i === report.daily.length - 1 ? dayFmt.format(d.day) : ""}
              </span>
            ))}
          </div>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-ink-soft underline underline-offset-4">Show as a table</summary>
            <table className="mt-2 w-full text-left">
              <thead className="text-ink-soft"><tr><th className="py-1">Day</th><th>Orders</th><th className="text-right">Money</th></tr></thead>
              <tbody>
                {report.daily.map((d) => (
                  <tr key={d.day.toISOString()} className="border-t border-black/10">
                    <td className="py-1">{dayFmt.format(d.day)}</td>
                    <td className="tabular-nums">{d.orders}</td>
                    <td className="text-right tabular-nums">{moneyFromCents(d.cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <section className="panel p-5">
            <h2 className="font-display text-xl">Restock soon</h2>
            {report.restock.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">Every title has more than {LOW_STOCK} copies. Nothing to restock.</p>
            ) : (
              <ul className="mt-3 divide-y divide-black/10">
                {report.restock.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                    <span>
                      <span className="font-semibold">{b.title}</span>
                      <span className="block text-xs text-ink-soft">{b.categoryName} · {b.unitsSold} sold</span>
                    </span>
                    <StockBadge stock={b.stock} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-xl">Top sellers</h2>
            {report.topSellers.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">No paid orders yet. Best-selling books will show here.</p>
            ) : (
              <ol className="mt-3 divide-y divide-black/10">
                {report.topSellers.map((b, i) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                    <span>
                      <span className="mr-2 text-ink-soft tabular-nums">{i + 1}.</span>
                      <span className="font-semibold">{b.title}</span>
                      <span className="block pl-6 text-xs text-ink-soft">{b.unitsSold} sold · {b.stock} left</span>
                    </span>
                    <span className="font-semibold tabular-nums">{moneyFromCents(b.revenueCents)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {isStore ? (
          <section className="panel mt-8 overflow-x-auto p-5">
            <h2 className="font-display text-xl">Earnings by seller</h2>
            <p className="mt-1 text-sm text-ink-soft">&quot;Store&quot; is books the admin added.</p>
            <table className="mt-3 w-full min-w-[480px] text-left text-sm">
              <thead className="text-ink-soft">
                <tr><th className="py-2">Seller</th><th className="text-right">Titles</th><th className="text-right">In stock</th><th className="text-right">Sold</th><th className="text-right">Money</th></tr>
              </thead>
              <tbody>
                {report.sellers.map((x) => (
                  <tr key={x.name} className="border-t border-black/10">
                    <td className="py-2 font-semibold">{x.name}</td>
                    <td className="text-right tabular-nums">{x.titles}</td>
                    <td className="text-right tabular-nums">{x.stock}</td>
                    <td className="text-right tabular-nums">{x.units}</td>
                    <td className="text-right tabular-nums">{moneyFromCents(x.cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        <section className="panel mt-8 overflow-x-auto p-5">
          <h2 className="font-display text-xl">Sales by category</h2>
          <table className="mt-3 w-full min-w-[480px] text-left text-sm">
            <thead className="text-ink-soft">
              <tr><th className="py-2">Category</th><th className="text-right">Titles</th><th className="text-right">In stock</th><th className="text-right">Sold</th><th className="text-right">Money</th></tr>
            </thead>
            <tbody>
              {report.categories.map((c) => (
                <tr key={c.name} className="border-t border-black/10">
                  <td className="py-2 font-semibold">{c.name}</td>
                  <td className="text-right tabular-nums">{c.titles}</td>
                  <td className="text-right tabular-nums">{c.stock}</td>
                  <td className="text-right tabular-nums">{c.units}</td>
                  <td className="text-right tabular-nums">{moneyFromCents(c.cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel mt-8 overflow-x-auto p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl">Stock and sales by book</h2>
            <p className="text-sm text-ink-soft">{report.books.length} titles</p>
          </div>
          <table className="mt-3 w-full min-w-[640px] text-left text-sm">
            <thead className="text-ink-soft">
              <tr><th className="py-2">Book</th><th>Category</th>{isStore ? <th>Seller</th> : null}<th className="text-right">Price</th><th className="text-right">In stock</th><th className="text-right">Sold</th><th className="text-right">Money</th></tr>
            </thead>
            <tbody>
              {report.books.map((b) => (
                <tr key={b.id} className="border-t border-black/10">
                  <td className="py-2">
                    <span className="font-semibold">{b.title}</span>
                    <span className="block text-xs text-ink-soft">{b.author}</span>
                  </td>
                  <td>{b.categoryName}</td>
                  {isStore ? <td>{b.sellerName}</td> : null}
                  <td className="text-right tabular-nums">{moneyFromCents(b.priceCents)}</td>
                  <td className="text-right"><StockBadge stock={b.stock} /></td>
                  <td className="text-right tabular-nums">{b.unitsSold}</td>
                  <td className="text-right tabular-nums">{moneyFromCents(b.revenueCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel mt-8 overflow-x-auto p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl">{isStore ? "Recent paid orders" : "Recent orders with your books"}</h2>
            {isStore ? <Link href="/orders" className="text-sm font-semibold text-forest underline underline-offset-4">See all orders</Link> : null}
          </div>
          {report.recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">No paid orders yet. They&apos;ll appear here as soon as customers check out.</p>
          ) : (
            <table className="mt-3 w-full min-w-[560px] text-left text-sm">
              <thead className="text-ink-soft">
                <tr><th className="py-2">Order</th><th>Customer</th><th>Paid</th><th className="text-right">{isStore ? "Books" : "Your books"}</th><th>Status</th><th className="text-right">{isStore ? "Total" : "You earned"}</th></tr>
              </thead>
              <tbody>
                {report.recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-black/10">
                    <td className="py-2 font-mono text-xs">#{o.id.slice(-6).toUpperCase()}</td>
                    <td>{o.customer}</td>
                    <td>{o.paidAt ? dateFmt.format(o.paidAt) : "—"}</td>
                    <td className="text-right tabular-nums">{o.units}</td>
                    <td>{STEP_LABEL[o.shippingStatus] ?? o.shippingStatus}</td>
                    <td className="text-right font-semibold tabular-nums">{moneyFromCents(o.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}
