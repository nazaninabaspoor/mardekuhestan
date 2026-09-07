import type { Metadata } from "next";
import Link from "next/link";

import { MagBoards } from "@/components/magazine/mag-boards";
import { MagMasonry } from "@/components/magazine/mag-card";
import { MagToday } from "@/components/magazine/mag-today";
import { magazineBoards } from "@/data/magazine-issue";
import { listArticles } from "@/lib/api/content";
import { mergeMagazinePins } from "@/lib/content/magazine-feed";

type Search = { q?: string };

async function loadIndex(q?: string) {
  try {
    const articles = await listArticles({ q, page: 1 });
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

  return (
    <>
      <MagToday query={q} />
      <div className="mk-mag-shell">
        <MagBoards boards={magazineBoards} active="all" />
        {pins.length ? (
          <MagMasonry pins={pins} />
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
