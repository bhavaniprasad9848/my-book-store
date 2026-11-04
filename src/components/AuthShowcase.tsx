import { Fragment } from "react";
import { BookJacket } from "@/components/BookJacket";

const STACK = [
  { title: "Birds Before Sunrise", author: "Tom Ellis", category: "nature" },
  { title: "Voices of Independence", author: "James Okoro", category: "history" },
  { title: "Map of the Hidden Harbor", author: "Selene Park", category: "adventure" },
];

/** Left-hand panel of the sign-in and register pages. `eyebrow` is accepted for compatibility but not shown. */
export function AuthShowcase({ title, subtitle }: { eyebrow?: string; title: string; subtitle: string }) {
  return (
    <section className="auth-hero">
      <svg className="auth-contours" viewBox="0 0 600 600" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse
            key={i}
            cx="300"
            cy="300"
            rx={60 + i * 34}
            ry={36 + i * 24}
            transform={`rotate(${-20 + i * 3} 300 300)`}
            style={{ animationDelay: `${0.2 + i * 0.12}s` }}
          />
        ))}
      </svg>
      <div className="relative">
        <p className="auth-wordmark">My Book Store</p>
        <h1 className="auth-title" aria-label={title}>
          {title.split(" ").map((word, i) => (
            <Fragment key={i}>
              <span className="word" aria-hidden="true">
                <span style={{ animationDelay: `${150 + i * 60}ms` }}>{word}</span>
              </span>{" "}
            </Fragment>
          ))}
        </h1>
        <p className="auth-subtitle">{subtitle}</p>
      </div>
      <div className="auth-books" aria-hidden="true">
        {STACK.map((b, i) => (
          <div key={b.title} className={`auth-book auth-book-${i}`}>
            <div className="auth-book-float" style={{ animationDelay: `${1.2 + i * 0.7}s` }}>
              <BookJacket title={b.title} author={b.author} category={b.category} variant={i + 1} className="block h-full w-full" />
              <span className="auth-book-shine" style={{ animationDelay: `${2 + i * 0.35}s` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
