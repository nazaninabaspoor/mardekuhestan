import {
  SearchLensMark,
  SearchMountainMark,
} from "@/components/search-brand-decoration";

type CatalogSearchFormProps = {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
};

export function CatalogSearchForm({
  className = "header-search tool-quiet",
  placeholder = "جستجو در راه سبز…",
  defaultValue = "",
}: CatalogSearchFormProps) {
  return (
    <form className={`mk-search-shell ${className}`.trim()} action="/products" role="search">
      <SearchMountainMark />
      <input
        type="search"
        name="q"
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete="off"
        aria-label="جستجو در محصولات"
        enterKeyHint="search"
        className="mk-search-input"
      />
      <button type="submit" aria-label="جستجو" className="mk-search-button">
        <SearchLensMark />
      </button>
    </form>
  );
}
