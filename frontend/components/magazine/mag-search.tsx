export function MagSearch({
  query = "",
  size = "hero",
  className = "",
}: {
  query?: string;
  size?: "hero" | "header";
  className?: string;
}) {
  const isHero = size === "hero";
  return (
    <form
      className={isHero ? "mk-mag-search" : `v2-header-search ${className}`.trim()}
      action="/magazine"
      role="search"
    >
      <input
        name="q"
        defaultValue={query}
        placeholder={isHero ? "در مجله بگردید؛ یک مسیر، یک طعم، یک نوشته…" : "جستجو در مجله…"}
        aria-label="جستجو در مجله"
        autoComplete="off"
      />
      <button type="submit" aria-label="جستجو">
        {isHero ? "جستجو" : (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="11" cy="11" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M20 20l-3.4-3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </button>
    </form>
  );
}
