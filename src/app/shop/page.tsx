import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, categoryById } from "@/lib/catalog";
import { Topbar } from "@/components/Topbar";
import { BookCard } from "@/components/BookCard";
import { AddBookForm } from "@/components/AddBookForm";
import { ShopHero } from "@/components/ShopHero";
import { CategoryBanner } from "@/components/CategoryBanner";
import { Role } from "@prisma/client";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ShopSearch } from "@/components/ShopSearch";

function shortName(name: string) {
  return name.replace(/ Books$/, "").replace(/^All Mix$/, "Mixed shelf");
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const active = params.category || "all";
  const isAdmin = session.user.role === Role.ADMIN;
  const activeCat = categoryById(active);
  const q = (params.q || "").trim().slice(0, 80);

  const books = await prisma.book.findMany({
    where: {
      ...(active !== "all" ? { category: active } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { author: { contains: q } }] } : {}),
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  const tab = (id: string, label: string) => (
    <Link
      key={id}
      href={`/shop?category=${id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
      className={`tab ${active === id ? "is-active" : ""}`}
      aria-current={active === id ? "page" : undefined}
    >
      {label}
    </Link>
  );

  return (
    <>
      <Topbar />
      <main className="page">
        {active === "all" && !q ? <ShopHero bookCount={books.length} /> : null}

        <div id="shelves" className="shop-toolbar">
          <nav className="tabs" aria-label="Book categories">
            {tab("all", "All books")}
            {CATEGORIES.map((cat) => tab(cat.id, shortName(cat.name)))}
          </nav>
          <ShopSearch />
        </div>

        {q ? (
          <p className="search-summary" aria-live="polite">
            {books.length === 0
              ? `No books match \u201c${q}\u201d. Try a different title or author.`
              : `${books.length} ${books.length === 1 ? "book matches" : "books match"} \u201c${q}\u201d.`}
          </p>
        ) : null}

        {isAdmin ? (
          <p className="admin-note">You are signed in as the owner. Each shelf has a form at the end for adding new titles.</p>
        ) : null}

        {active === "all" ? (
          CATEGORIES.map((cat) => {
            const sectionBooks = books.filter((book) => book.category === cat.id);
            if (q && sectionBooks.length === 0) return null;
            return (
              <section key={cat.id} className="shelf-section">
                <CategoryBanner
                  id={cat.id}
                  name={shortName(cat.name)}
                  blurb={cat.blurb}
                  count={sectionBooks.length}
                  showLink
                />
                <div className="book-grid reveal">
                  {sectionBooks.map((book, i) => (
                    <BookCard key={book.id} index={i} book={{ ...book, categoryName: cat.name }} />
                  ))}
                </div>
                {isAdmin ? <AddBookForm category={cat.id} /> : null}
              </section>
            );
          })
        ) : (
          <section className="shelf-section">
            {activeCat ? (
              <CategoryBanner id={active} name={shortName(activeCat.name)} blurb={activeCat.blurb} count={books.length} />
            ) : null}
            {books.length === 0 ? (
              <p className="text-ink-soft">
                {q ? "Nothing on this shelf matches your search." : "This shelf is empty right now. Check another category or come back soon."}
              </p>
            ) : (
              <div className="book-grid reveal">
                {books.map((book, i) => (
                  <BookCard key={book.id} index={i} book={{ ...book, categoryName: activeCat?.name || book.category }} />
                ))}
              </div>
            )}
            {isAdmin ? <AddBookForm category={active} /> : null}
          </section>
        )}
      </main>
      <RevealOnScroll />
      <footer className="site-footer">
        <p>My Book Store sells second-hand books from a house collection. Prices include tax. Questions about an order? Reply to your receipt email.</p>
      </footer>
    </>
  );
}
