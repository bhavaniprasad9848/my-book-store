import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/categories";
import { ratingSummaries } from "@/lib/ratings";
import { LiveStockProvider } from "@/components/LiveStock";
import { AddCategoryForm } from "@/components/AddCategoryForm";
import { Topbar } from "@/components/Topbar";
import { BookCard } from "@/components/BookCard";
import { AddBookForm } from "@/components/AddBookForm";
import { ShopHero } from "@/components/ShopHero";
import { BookMarquee } from "@/components/BookMarquee";
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
  const isSeller = session.user.role === Role.SELLER;
  const canAdd = isAdmin || isSeller;
  const canBuy = session.user.role === Role.CUSTOMER;
  const categories = await getCategories();
  const activeCat = categories.find((c) => c.id === active);
  const q = (params.q || "").trim().slice(0, 80);

  const books = await prisma.book.findMany({
    where: {
      ...(active !== "all" ? { category: active } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { author: { contains: q } }] } : {}),
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });
  const ratings = await ratingSummaries(books.map((b) => b.id));
  const initialStock = Object.fromEntries(books.map((b) => [b.id, b.stock]));

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
        {active === "all" && !q && books.length > 0 ? (
          <section className="fresh-strip" aria-label="Fresh on the shelves">
            <h2 className="fresh-title">Fresh on the shelves</h2>
            <BookMarquee
              books={[...books]
                .sort((a, b) => +b.createdAt - +a.createdAt)
                .slice(0, 16)
                .map((b) => ({ id: b.id, title: b.title, author: b.author, category: b.category }))}
              seconds={60}
              linkToShelf
              label="Recently added books, moving slowly. Hover to pause."
            />
          </section>
        ) : null}

        <div id="shelves" className="shop-toolbar">
          <nav className="tabs" aria-label="Book categories">
            {tab("all", "All books")}
            {categories.map((cat) => tab(cat.id, shortName(cat.name)))}
          </nav>
          <ShopSearch suggestions={books.filter((_, i) => i % 3 === 0).slice(0, 8).map((b) => b.title)} />
        </div>

        {q ? (
          <p className="search-summary" aria-live="polite">
            {books.length === 0
              ? `No books match \u201c${q}\u201d. Try a different title or author.`
              : `${books.length} ${books.length === 1 ? "book matches" : "books match"} \u201c${q}\u201d.`}
          </p>
        ) : null}

        {isAdmin ? (
          <>
            <p className="admin-note">You are signed in as the admin. Each shelf has a form at the end for adding store books, and you can add new categories below.</p>
            <AddCategoryForm />
          </>
        ) : isSeller ? (
          <p className="admin-note">You are signed in as a seller. Use the form at the end of any shelf to list a book. Your stock and sales are on your Dashboard.</p>
        ) : null}

        <LiveStockProvider initial={initialStock}>

        {active === "all" ? (
          categories.map((cat) => {
            const sectionBooks = books.filter((book) => book.category === cat.id);
            if (sectionBooks.length === 0 && (q || !canAdd)) return null;
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
                    <BookCard key={book.id} index={i} rating={ratings[book.id]} canBuy={canBuy} book={{ ...book, categoryName: cat.name }} />
                  ))}
                </div>
                {canAdd ? <AddBookForm category={cat.id} /> : null}
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
                  <BookCard
                    key={book.id}
                    canBuy={canBuy}
                    index={i}
                    rating={ratings[book.id]}
                    book={{ ...book, categoryName: activeCat?.name || book.category }}
                  />
                ))}
              </div>
            )}
            {canAdd ? <AddBookForm category={active} /> : null}
          </section>
        )}
        </LiveStockProvider>
      </main>
      <RevealOnScroll />
      <footer className="site-footer">
        <p>My Book Store sells second-hand books from a house collection. Prices include tax. Questions about an order? Reply to your receipt email.</p>
      </footer>
    </>
  );
}
