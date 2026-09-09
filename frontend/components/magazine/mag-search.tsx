import {
  SearchLensMark,
  SearchMountainMark,
} from "@/components/search-brand-decoration";

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
      className={`${isHero ? "mk-mag-search" : `v2-header-search ${className}`} mk-search-shell`.trim()}
      action="/magazine"
      role="search"
    >
      <SearchMountainMark />
      <input
        name="q"
        defaultValue={query}
        placeholder={isHero ? "در مجله بگردید یک مسیر و یک طعم و یک نوشته" : "جستجو در مجله"}
        aria-label="جستجو در مجله"
        autoComplete="off"
        className="mk-search-input"
      />
      <button type="submit" aria-label="جستجو" className="mk-search-button">
        <SearchLensMark />
      </button>
    </form>
  );
}
