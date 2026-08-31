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
    <form className={className} action="/products" role="search">
      <input
        type="search"
        name="q"
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete="off"
        aria-label="جستجو در محصولات"
        enterKeyHint="search"
      />
      <button type="submit" aria-label="جستجو">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle
            cx="11"
            cy="11"
            r="6.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M20 20l-3.4-3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </button>
    </form>
  );
}
