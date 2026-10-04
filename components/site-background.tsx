/**
 * Site-wide decorative backdrop.
 *
 * A fixed, non-interactive layer that sits behind every route: a faint
 * architectural grid, three slowly drifting aurora washes, film grain and a
 * soft vignette. It is what gives the whole site a consistent, premium surface
 * without touching any page markup.
 *
 * All motion is transform-based and disabled under `prefers-reduced-motion`.
 */
export function SiteBackground() {
  return (
    <>
      <div aria-hidden className="site-backdrop">
        <span className="site-backdrop__grid" />
        <span className="site-backdrop__aurora site-backdrop__aurora--a" />
        <span className="site-backdrop__aurora site-backdrop__aurora--b" />
        <span className="site-backdrop__aurora site-backdrop__aurora--c" />
        <span className="site-backdrop__grain" />
        <span className="site-backdrop__vignette" />
      </div>

      {/* Reading progress for long pages (articles, services, FAQs). */}
      <div aria-hidden className="site-progress" />
    </>
  );
}
