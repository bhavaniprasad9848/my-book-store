/**
 * Re-mounts on every navigation. A paper page swings away on its spine to reveal the new page,
 * like turning a page in a book, and the content eases in underneath.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="route-enter">
      <div className="page-turn" aria-hidden="true">
        <span className="page-turn-sheet" />
      </div>
      {children}
    </div>
  );
}
