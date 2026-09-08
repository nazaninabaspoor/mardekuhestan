import Link from "next/link";

function fa(n: number) {
  return n.toLocaleString("fa-IR");
}

function pageWindow(page: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const set = new Set([1, pageCount, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  for (const num of nums) {
    const prev = out[out.length - 1];
    if (typeof prev === "number" && num - prev > 1) out.push("gap");
    out.push(num);
  }
  return out;
}

function Arrow({ dir }: { dir: "next" | "prev" }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      {dir === "next" ? (
        <path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function LockMark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <rect x="6.5" y="11" width="11" height="8.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.8 11V8.6a3.2 3.2 0 0 1 6.4 0V11" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function MagPager({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount < 1) return null;

  const prev = page > 1 ? hrefFor(page - 1) : null;
  const next = page < pageCount ? hrefFor(page + 1) : null;

  return (
    <nav className="mk-folio" aria-label="برگ‌های مجله">
      <div className="mk-folio-peak" aria-hidden="true" />
      <div className="mk-folio-tray">
        {prev ? (
          <Link className="mk-folio-btn" href={prev} rel="prev">
            <Arrow dir="prev" />
            قبلی
          </Link>
        ) : (
          <span className="mk-folio-btn is-locked" aria-disabled="true">
            <LockMark />
            قبلی
          </span>
        )}

        <ol className="mk-folio-pages">
          {pageWindow(page, pageCount).map((item, index) =>
            item === "gap" ? (
              <li key={`gap-${index}`} className="mk-folio-gap" aria-hidden="true">
                …
              </li>
            ) : (
              <li key={item}>
                {item === page ? (
                  <span className="mk-folio-num is-current" aria-current="page">
                    {fa(item)}
                  </span>
                ) : (
                  <Link className="mk-folio-num" href={hrefFor(item)}>
                    {fa(item)}
                  </Link>
                )}
              </li>
            ),
          )}
        </ol>

        {next ? (
          <Link className="mk-folio-btn" href={next} rel="next">
            بعدی
            <Arrow dir="next" />
          </Link>
        ) : (
          <span className="mk-folio-btn is-locked" aria-disabled="true">
            بعدی
            <LockMark />
          </span>
        )}
      </div>
      <p className="mk-folio-status">
        برگ {fa(page)} از {fa(pageCount)}
      </p>
    </nav>
  );
}
