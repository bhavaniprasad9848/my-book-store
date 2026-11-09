import { BookLoader } from "@/components/BookLoader";

/** Shown while the shop loads or a category/search is fetched: shimmering placeholder books. */
export default function ShopLoading() {
  return (
    <main className="page" aria-busy="true" aria-label="Loading books">
      <BookLoader label="Finding your books" />
      <div className="tabs skeleton-tabs">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="skeleton h-4" style={{ width: `${48 + (i % 3) * 18}px` }} />
        ))}
      </div>
      <section className="shelf-section">
        <span className="skeleton block h-8 w-40" />
        <span className="skeleton mt-3 block h-4 w-72" />
        <div className="book-grid mt-8">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="book-item">
              <div className="book-cover-wrap">
                <span className="skeleton block aspect-[2/3] w-full" />
              </div>
              <span className="skeleton mt-4 block h-5 w-4/5" />
              <span className="skeleton mt-2 block h-4 w-1/2" />
              <span className="skeleton mt-3 block h-3 w-full" />
              <span className="skeleton mt-1.5 block h-3 w-2/3" />
              <div className="mt-5 flex items-center justify-between">
                <span className="skeleton block h-5 w-14" />
                <span className="skeleton block h-9 w-28" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
