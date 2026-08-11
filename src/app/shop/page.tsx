import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, categoryById } from "@/lib/catalog";
import { Topbar } from "@/components/Topbar";
import { BookCard } from "@/components/BookCard";
import { AddBookForm } from "@/components/AddBookForm";
import { Role } from "@prisma/client";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const active = params.category || "all";
  const isAdmin = session.user.role === Role.ADMIN;

  const books = await prisma.book.findMany({
    where: active !== "all" ? { category: active } : undefined,
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  const activeLabel =
    active === "all" ? "All 6 types" : categoryById(active)?.name || "Books";

  return (
    <>
      <Topbar />
      <main className="mx-auto w-[min(1120px,calc(100%-2rem))] pb-16 pt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl">{activeLabel}</h1>
            <p className="mt-2 max-w-xl text-ink-soft">
              {isAdmin
                ? "Browse inventory and add new titles at the end of each section."
                : "Choose books from the house collection and add them to your cart."}
            </p>
          </div>
          <Link href="/shop?category=all" className="btn-secondary">
            Show all types
          </Link>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <Link
            href="/shop?category=all"
            className={`rounded-full border px-3 py-2 text-sm ${
              active === "all" ? "border-ink bg-ink text-[#f8f4ec]" : "border-black/10 bg-white/80"
            }`}
          >
            All types
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className={`rounded-full border px-3 py-2 text-sm ${
                active === cat.id
                  ? "border-ink bg-ink text-[#f8f4ec]"
                  : "border-black/10 bg-white/80"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {active === "all"
          ? CATEGORIES.map((cat) => {
              const sectionBooks = books.filter((book) => book.category === cat.id);
              return (
                <section key={cat.id} className="mb-8">
                  <h2 className="mb-3 font-display text-2xl">{cat.name}</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sectionBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={{
                          ...book,
                          accent: cat.accent,
                          categoryName: cat.name,
                        }}
                      />
                    ))}
                  </div>
                  {isAdmin ? <AddBookForm category={cat.id} /> : null}
                </section>
              );
            })
          : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => {
                  const cat = categoryById(book.category);
                  return (
                    <BookCard
                      key={book.id}
                      book={{
                        ...book,
                        accent: cat?.accent || "#245c45",
                        categoryName: cat?.name || book.category,
                      }}
                    />
                  );
                })}
              </div>
              {isAdmin ? <AddBookForm category={active} /> : null}
            </>
          )}
      </main>
    </>
  );
}
