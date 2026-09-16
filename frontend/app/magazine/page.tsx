import type { Metadata } from "next";
import Link from "next/link";

import { MagMasonry } from "@/components/magazine/mag-card";
import { MagPager } from "@/components/magazine/mag-pager";
import { MagToday } from "@/components/magazine/mag-today";
import { listArticles } from "@/lib/api/content";
import {
  magazineListHref,
  mergeMagazinePins,
  windowMagazinePins,
} from "@/lib/content/magazine-feed";
import { loadMagazineBoards, loadMagazinePage } from "@/lib/content/magazine-page";

async function loadIndex() {
  try {
    const articles = await listArticles({ page: 1, pageSize: 80 }, { revalidate: false });
    return articles.results || [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "مجله مرد کوهستان | این راه سبز است",
  description: "مجله راه سبز: نوشته‌هایی از مرتع، مزرعه، غذا و زندگی در ارتفاع.",
};

export default async function MagazinePage() {
  const [articles, boards, page] = await Promise.all([
    loadIndex(),
    loadMagazineBoards(),
    loadMagazinePage(),
  ]);
  const pins = mergeMagazinePins(articles);
  const leaf = windowMagazinePins(pins, 1);

  return (
    <>
      <MagToday query="" boards={boards} active="all" page={page} />
      <div className="mk-mag-shell">
        {leaf.total ? (
          <>
            <MagMasonry pins={leaf.items} feed />
            <MagPager
              page={leaf.page}
              pageCount={leaf.pageCount}
              hrefFor={(pageNum) => magazineListHref({ page: pageNum, hash: "#mk-feed" })}
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
