import { BookJacket } from "@/components/BookJacket";

/** A real-looking book in 3D (cover, spine, page block) that slowly turns. Decorative. */
export function Book3D({
  title,
  author,
  category,
  className = "",
}: {
  title: string;
  author: string;
  category: string;
  className?: string;
}) {
  return (
    <div className={`book3d-stage ${className}`} aria-hidden="true">
      <div className="book3d">
        <div className="book3d-face book3d-front">
          <BookJacket title={title} author={author} category={category} variant={1} className="block h-full w-full" />
        </div>
        <div className="book3d-face book3d-pages" />
        <div className="book3d-face book3d-spine">
          <span>{title}</span>
        </div>
        <div className="book3d-face book3d-back" />
      </div>
      <div className="book3d-shadow" />
    </div>
  );
}
