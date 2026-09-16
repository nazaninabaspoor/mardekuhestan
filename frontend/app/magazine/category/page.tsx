import type { Metadata } from "next";

import { MagBoards } from "@/components/magazine/mag-boards";
import { MagMasonry } from "@/components/magazine/mag-card";
import { MagPager } from "@/components/magazine/mag-pager";
import { listArticles } from "@/lib/api/content";
import {
  magazineListHref,
  mergeMagazinePins,
  windowMagazinePins,
} from "@/lib/content/magazine-feed";
import { loadMagazineBoards } from "@/lib/content/magazine-page";

export const metadata: Metadata = {
  title: "قفسه‌های مجله | مرد کوهستان",
  description:
    "دسته‌های تصویری مجله مرد کوهستان: راه سبز، از مرتع تا سفره، سفره خانواده، مرتع و ارتفاع.",
};

export default async function MagazineCategoryIndexPage() {
  const [boards, apiArticles] = await Promise.all([
    loadMagazineBoards(),
    listArticles({ page: 1, pageSize: 80 }, { revalidate: false })
      .then((res) => res.results || [])
      .catch(() => []),
  ]);
  const pins = mergeMagazinePins(apiArticles);
  const leaf = windowMagazinePins(pins, 1);

  return (
    <div className="mk-mag-shell">
      <header className="mk-shelf-head">
        <p>مجله مرد کوهستان</p>
        <h2>قفسه‌ها</h2>
        <span>هر قفسه یک موضوع است. یکی را باز کنید.</span>
      </header>
      <MagBoards boards={boards} active="all" />
      <MagMasonry pins={leaf.items} feed />
      <MagPager
        page={leaf.page}
        pageCount={leaf.pageCount}
        hrefFor={(nextPage) =>
          magazineListHref({ page: nextPage, path: "/magazine/category", hash: "#mk-feed" })
        }
      />
    </div>
  );
}
