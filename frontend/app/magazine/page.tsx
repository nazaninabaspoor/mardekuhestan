import type { Metadata } from "next";
import Link from "next/link";

import { MagBoards } from "@/components/magazine/mag-boards";
import { MagMasonry } from "@/components/magazine/mag-card";
import { magazineBoards } from "@/data/magazine-issue";
import { listArticles, listCategories, unwrapResults } from "@/lib/api/content";
import { mergeMagazinePins } from "@/lib/content/magazine-feed";

type Search = { q?: string; page?: string };

async function loadIndex(q?: string, page = 1) {
  try {
    const [articles, categories] = await Promise.all([
      listArticles({ q, page }),
      listCategories(),
    ]);
    return {
      articles: articles.results || [],
      count: articles.count || 0,
      categories: unwrapResults(categories),
    };
  } catch {
    return { articles: [], count: 0, categories: [] };
  }
}

export const metadata: Metadata = {
  title: "مجله مرد کوهستان | این راه سبز است",
  description: "ایده‌ها و نوشته‌های راه سبز: مرتع، مزرعه، غذا و زندگی در ارتفاع.",
};

export default async function MagazinePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const page = Math.max(1, Number(params.page || 1) || 1);
  const { articles, count, categories } = await loadIndex(q, page);
  const pins = mergeMagazinePins(articles, q);
  const totalPages = Math.max(1, Math.ceil(count / 12));
  const apiCats = categories.filter((cat) => !magazineBoards.some((board) => board.slug === cat.slug));

  return (
    <div className="mk-mag-shell">
      <header className="mk-pin-head">
        <div>
          <p className="mk-mag-kicker">مجله مرد کوهستان</p>
          <h1>{q ? `جستجو برای «${q}»` : "ایده‌هایی از راه سبز"}</h1>
          <p className="mk-pin-lead">
            از مرتع و مزرعه تا سفره. تصویر اول می‌آید، بعد نوشته.
          </p>
        </div>
        <form className="mk-pin-search" action="/magazine" method="get">
          <input name="q" defaultValue={q} placeholder="در مجله بگردید…" aria-label="جستجوی مجله" />
          <button type="submit" aria-label="جستجو">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16l4.2 4.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </header>

      {!q ? <MagBoards boards={magazineBoards} /> : null}

      <nav className="mk-mag-rail" aria-label="دسته‌بندی مجله">
        <Link className={`mk-mag-chip${!q ? " is-active" : ""}`} href="/magazine">
          همه ایده‌ها
        </Link>
        <Link className="mk-mag-chip" href="/magazine/category">
          قفسه‌ها
        </Link>
        {magazineBoards.map((board) => (
          <Link key={board.slug} className="mk-mag-chip" href={`/magazine/category/${board.slug}`}>
            {board.name}
          </Link>
        ))}
        {apiCats.map((cat) => (
          <Link key={cat.slug} className="mk-mag-chip" href={`/magazine/category/${cat.slug}`}>
            {cat.name}
            {typeof cat.article_count === "number" ? <small>{cat.article_count}</small> : null}
          </Link>
        ))}
      </nav>

      {pins.length ? (
        <MagMasonry pins={pins} />
      ) : (
        <div className="mk-mag-empty">
          <h2>چیزی با این جستجو پیدا نشد</h2>
          <p>یک واژه دیگر از راه سبز را امتحان کنید.</p>
        </div>
      )}

      {count > 12 && totalPages > 1 ? (
        <nav className="mk-mag-pager" aria-label="صفحه‌بندی مجله">
          {page > 1 ? (
            <Link href={page === 2 ? "/magazine" : `/magazine?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>
              صفحه قبل
            </Link>
          ) : (
            <span />
          )}
          <span>
            {page} از {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/magazine?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>صفحه بعد</Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
