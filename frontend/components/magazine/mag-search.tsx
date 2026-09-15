import {
  SearchLensMark,
  SearchMountainMark,
} from "@/components/search-brand-decoration";

export function MagSearch({
  query = "",
  size = "hero",
  className = "",
  placeholder,
}: {
  query?: string;
  size?: "hero" | "header";
  className?: string;
  placeholder?: string;
}) {
  const isHero = size === "hero";
  const heroPlaceholder =
    placeholder || "در مجله بگردید یک مسیر و یک طعم و یک نوشته";
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
        placeholder={isHero ? heroPlaceholder : "جستجو در مجله"}
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
