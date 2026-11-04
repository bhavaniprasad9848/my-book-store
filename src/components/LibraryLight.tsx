/**
 * Quiet ambient background: soft window light drifting slowly across the page,
 * with a few specks of dust floating in it. Pure CSS, no JavaScript.
 */
export function LibraryLight() {
  return (
    <div className="library-light" aria-hidden="true">
      <span className="window-light window-light-a" />
      <span className="window-light window-light-b" />
      <span className="window-light window-light-c" />
      <span className="dust dust-a" />
      <span className="dust dust-b" />
    </div>
  );
}
