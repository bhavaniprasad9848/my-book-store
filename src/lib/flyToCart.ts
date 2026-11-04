/**
 * Animates a small copy of a book cover from the card to the header cart link.
 * Does nothing when the person prefers reduced motion or the cart link is missing.
 */
export function flyToCart(source: Element | null) {
  if (typeof window === "undefined" || !source) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.getElementById("cart-link");
  if (!target) return;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const clone = source.cloneNode(true) as HTMLElement;
  const width = Math.min(from.width, 90);
  const height = width * 1.5;

  Object.assign(clone.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - width / 2}px`,
    top: `${from.top + from.height / 2 - height / 2}px`,
    width: `${width}px`,
    height: `${height}px`,
    margin: "0",
    zIndex: "60",
    pointerEvents: "none",
    boxShadow: "6px 10px 22px rgba(28, 36, 32, 0.3)",
  });
  document.body.appendChild(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const flight = clone.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.55 - 70}px) scale(0.6) rotate(-8deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(-14deg)`, opacity: 0.2 },
    ],
    { duration: 720, easing: "cubic-bezier(0.45, 0, 0.2, 1)" }
  );
  flight.onfinish = () => {
    clone.remove();
    target.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-3px)" }, { transform: "translateY(0)" }],
      { duration: 260, easing: "ease-out" }
    );
  };
}
