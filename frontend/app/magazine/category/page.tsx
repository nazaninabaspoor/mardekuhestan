import type { Metadata } from "next";

import { MagBoards } from "@/components/magazine/mag-boards";
import { MagMasonry } from "@/components/magazine/mag-card";
import { MagPager } from "@/components/magazine/mag-pager";
import { magazineBoards, magazinePins } from "@/data/magazine-issue";
import { issueToPin, magazineListHref, paginatePins, parseMagazinePage } from "@/lib/content/magazine-feed";

export const metadata: Metadata = {
  title: "قفسه‌های مجله | مرد کوهستان",
  description: "دسته‌های تصویری مجله مرد کوهستان: راه ما، مسیر غذا، زندگی خانگی، مزرعه و مرتع.",
};

export default async function MagazineCategoryIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const leaf = paginatePins(magazinePins.map(issueToPin), parseMagazinePage(page));

  return (
    <div className="mk-mag-shell">
      <header className="mk-shelf-head">
        <p>مجله مرد کوهستان</p>
        <h2>قفسه‌ها</h2>
        <span>هر قفسه یک موضوع است. یکی را باز کنید.</span>
      </header>
      <MagBoards boards={magazineBoards} active="all" />
      <MagMasonry pins={leaf.items} feed />
      <MagPager
        page={leaf.page}
        pageCount={leaf.pageCount}
        hrefFor={(nextPage) => magazineListHref({ page: nextPage, path: "/magazine/category", hash: "#mk-feed" })}
      />
    </div>
  );
}
