/** Re-mounts on every navigation, so each page's main content eases in like a turned page. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-enter">{children}</div>;
}
