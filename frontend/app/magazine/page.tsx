import type { Metadata } from "next";
import Link from "next/link";

import { MagBoards } from "@/components/magazine/mag-boards";
import { MagMasonry } from "@/components/magazine/mag-card";
import { MagPager } from "@/components/magazine/mag-pager";
import { MagToday } from "@/components/magazine/mag-today";
import { magazineBoards } from "@/data/magazine-issue";
import { listArticles } from "@/lib/api/content";
import {
  magazineListHref,
  mergeMagazinePins,
  paginatePins,
  parseMagazinePage,
} from "@/lib/content/magazine-feed";

type Search = { q?: string; page?: string };

async function loadIndex(q?: string) {
  try {
    const articles = await listArticles({ q, page: 1, pageSize: 80 });
    return articles.results || [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "مجله مرد کوهستان | این راه سبز است",
  description: "مجله راه سبز: نوشته‌هایی از مرتع، مزرعه، غذا و زندگی در ارتفاع.",
};

export default async function MagazinePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const articles = await loadIndex(q);
  const pins = mergeMagazinePins(articles, q);
  const leaf = paginatePins(pins, parseMagazinePage(params.page));

  return (
    <>
      <MagToday query={q} />
      <div className="mk-mag-shell">
        <MagBoards boards={magazineBoards} active="all" />
        {leaf.total ? (
          <>
            <MagMasonry pins={leaf.items} feed />
            <MagPager
              page={leaf.page}
              pageCount={leaf.pageCount}
              hrefFor={(page) => magazineListHref({ page, q, hash: "#mk-feed" })}
            />
          </>
        ) : (
          <div className="mk-mag-empty">
            <h2>چیزی با این جستجو پیدا نشد</h2>
            <p>
              <Link href="/magazine" className="mk-mag-read">
                بازگشت به مجله
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
