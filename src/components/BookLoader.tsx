/** Small open book whose pages flip while something loads. */
export function BookLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="book-loader" role="status" aria-label={label}>
      <div className="book-loader-book" aria-hidden="true">
        <span className="bl-cover bl-left" />
        <span className="bl-cover bl-right" />
        <span className="bl-page" style={{ animationDelay: "0s" }} />
        <span className="bl-page" style={{ animationDelay: "0.35s" }} />
        <span className="bl-page" style={{ animationDelay: "0.7s" }} />
      </div>
      <span className="book-loader-text">{label}</span>
    </div>
  );
}
