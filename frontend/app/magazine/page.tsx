import type { Metadata } from "next";
import Link from "next/link";

import { MagMasonry } from "@/components/magazine/mag-card";
import { MagPager } from "@/components/magazine/mag-pager";
import { MagToday } from "@/components/magazine/mag-today";
import { listArticles } from "@/lib/api/content";
import {
  magazineListHref,
  mergeMagazinePins,
  parseMagazinePage,
  windowMagazinePins,
} from "@/lib/content/magazine-feed";
import { loadMagazineBoards, loadMagazinePage } from "@/lib/content/magazine-page";

type Search = { q?: string; page?: string };

async function loadIndex(q?: string) {
  try {
    const articles = await listArticles({ q, page: 1, pageSize: 80 }, { revalidate: false });
    return articles.results || [];
  } catch {
    return [];
  }
}

export const dynamic =
  process.env.STATIC_EXPORT === "1" ? "force-static" : "force-dynamic";

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
  const [articles, boards, page] = await Promise.all([
    loadIndex(q),
    loadMagazineBoards(),
    loadMagazinePage(),
  ]);
  const pins = mergeMagazinePins(articles, q);
  const leaf = windowMagazinePins(pins, parseMagazinePage(params.page));

  return (
    <>
      <MagToday query={q} boards={boards} active="all" page={page} />
      <div className="mk-mag-shell">
        {leaf.total ? (
          <>
            <MagMasonry pins={leaf.items} feed />
            <MagPager
              page={leaf.page}
              pageCount={leaf.pageCount}
              hrefFor={(pageNum) => magazineListHref({ page: pageNum, q, hash: "#mk-feed" })}
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
