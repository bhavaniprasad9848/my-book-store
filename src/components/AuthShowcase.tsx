import { Fragment } from "react";
import { BookMarquee } from "@/components/BookMarquee";

const ROW_A = [
  { title: "Birds Before Sunrise", author: "Tom Ellis", category: "nature" },
  { title: "Voices of Independence", author: "James Okoro", category: "history" },
  { title: "Map of the Hidden Harbor", author: "Selene Park", category: "adventure" },
  { title: "The Moonlit Treehouse", author: "Priya Nair", category: "kids" },
  { title: "Algebra Essentials Workbook", author: "Marcus Lin", category: "school" },
  { title: "Kitchen Stories & Spices", author: "Ananya Mehta", category: "mix" },
];
const ROW_B = [
  { title: "The Clockmakers of Vienna", author: "Erik Lang", category: "history" },
  { title: "Ocean Currents Explained", author: "Mateo Ruiz", category: "nature" },
  { title: "Ridge of the Copper Storm", author: "Kai Morgan", category: "adventure" },
  { title: "Counting Clouds", author: "Amira Cole", category: "kids" },
  { title: "Puzzle Nights Anthology", author: "Various Authors", category: "mix" },
  { title: "World Geography Atlas for Students", author: "Nina Kapoor", category: "school" },
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
      <div className="auth-marquees" aria-hidden="true">
        <BookMarquee books={ROW_A} seconds={46} size="sm" />
        <BookMarquee books={ROW_B} seconds={54} size="sm" reverse />
      </div>
    </section>
  );
}
