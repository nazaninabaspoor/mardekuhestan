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

function PeakMark() {
  return (
    <svg className="mk-folio-peak" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        d="M3.4 19.2 12 4.8 20.6 19.2Z"
      />
    </svg>
  );
}

function Leaf({
  n,
  current,
  href,
}: {
  n: number;
  current: boolean;
  href?: string;
}) {
  const inner = (
    <>
      <span className="mk-folio-leaf-pages" aria-hidden="true" />
      <span className="mk-folio-leaf-spine" aria-hidden="true" />
      <span className="mk-folio-leaf-face">
        <PeakMark />
        <b>{fa(n)}</b>
      </span>
    </>
  );

  if (current) {
    return (
      <span className="mk-folio-leaf is-current" aria-current="page">
        {inner}
      </span>
    );
  }

  return (
    <Link className="mk-folio-leaf" href={href || "#"}>
      {inner}
    </Link>
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
      <div className="mk-folio-shelf">
        {prev ? (
          <Link className="mk-folio-turn" href={prev} rel="prev">
            قبلی
          </Link>
        ) : (
          <span className="mk-folio-turn is-quiet">قبلی</span>
        )}

        <ol className="mk-folio-pages">
          {pageWindow(page, pageCount).map((item, index) =>
            item === "gap" ? (
              <li key={`gap-${index}`} className="mk-folio-gap" aria-hidden="true" />
            ) : (
              <li key={item}>
                <Leaf n={item} current={item === page} href={hrefFor(item)} />
              </li>
            ),
          )}
        </ol>

        {next ? (
          <Link className="mk-folio-turn" href={next} rel="next">
            بعدی
          </Link>
        ) : (
          <span className="mk-folio-turn is-quiet">بعدی</span>
        )}
      </div>

      <p className="mk-folio-status">
        برگ {fa(page)} از {fa(pageCount)}
      </p>
    </nav>
  );
}
