import Link from "next/link";

type Props = {
  id: string;
  name: string;
  blurb: string;
  count: number;
  showLink?: boolean;
  /** Kept for compatibility with older callers; the new design does not use them. */
  accent?: string;
  photo?: string | null;
};

/** Section heading for one category shelf. */
export function CategoryBanner({ id, name, blurb, count, showLink = false }: Props) {
  return (
    <div className="section-head reveal">
      <div>
        <h2 className="section-title">{name}</h2>
        <p className="section-blurb">{blurb}</p>
      </div>
      {showLink ? (
        <Link href={`/shop?category=${id}`} className="text-link">
          See all {count}
        </Link>
      ) : (
        <span className="text-ink-soft text-sm">{count === 1 ? "1 book" : `${count} books`}</span>
      )}
    </div>
  );
}
