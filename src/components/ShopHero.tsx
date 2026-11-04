import { Fragment } from "react";
import { BookJacket } from "@/components/BookJacket";
import { CountUp } from "@/components/AnimatedNumber";

const FEATURED = [
  { title: "Ridge of the Copper Storm", author: "Kai Morgan", category: "adventure" },
  { title: "The Clockmakers of Vienna", author: "Erik Lang", category: "history" },
  { title: "Forest Quiet: A Field Companion", author: "Ivy Chen", category: "nature" },
  { title: "Kitchen Stories & Spices", author: "Ananya Mehta", category: "mix" },
  { title: "Empires Along the Silk Road", author: "Farah Rahman", category: "history" },
];

const HEADLINE = "Second-hand books, chosen one shelf at a time.";

export function ShopHero({ bookCount }: { bookCount: number }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1 className="hero-title" aria-label={HEADLINE}>
          {HEADLINE.split(" ").map((word, i) => (
            <Fragment key={i}>
              <span className="word" aria-hidden="true">
                <span style={{ animationDelay: `${i * 55}ms` }}>{word}</span>
              </span>{" "}
            </Fragment>
          ))}
        </h1>
        <p className="hero-text">
          <CountUp to={bookCount} /> titles in good reading condition, each checked by hand before it goes on the shelf.
          Free shipping on orders over $40.
        </p>
        <a href="#shelves" className="btn-primary hero-cta">
          Browse the shelves
        </a>
      </div>
      <div className="hero-shelf" aria-hidden="true">
        <div className="hero-books">
          {FEATURED.map((b, i) => (
            <div key={b.title} className="hero-book" style={{ animationDelay: `${520 + i * 110}ms` }}>
              <BookJacket title={b.title} author={b.author} category={b.category} variant={i + 1} className="block h-full w-full" />
            </div>
          ))}
        </div>
        <div className="shelf-board" />
      </div>
    </section>
  );
}
