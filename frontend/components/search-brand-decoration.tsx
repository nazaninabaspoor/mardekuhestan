export function SearchMountainMark() {
  return (
    <span className="mk-search-mountain" aria-hidden="true">
      <svg viewBox="0 0 78 34" focusable="false">
        <path className="mk-search-mountain-back" d="M2 29 20 16l8 7L42 5l12 13 7-6 15 17" />
        <path d="m20 16 5 4 3 3M42 5l-7 14 7-5 5 6 7-2M61 12l-4 11 5-4 6 6" />
        <path className="mk-search-mountain-ground" d="M3 29h72" />
      </svg>
    </span>
  );
}

export function SearchLensMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="10.5" cy="10.5" r="5.7" fill="none" stroke="currentColor" strokeWidth="1.65" />
      <path d="m15 15 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}
