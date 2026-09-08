import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MagBoards } from "@/components/magazine/mag-boards";
import { MagMasonry } from "@/components/magazine/mag-card";
import { MagPager } from "@/components/magazine/mag-pager";
import { boardBySlug, magazineBoards } from "@/data/magazine-issue";
import { listArticles, listCategories, unwrapResults } from "@/lib/api/content";
import {
  magazineListHref,
  mergeCategoryPins,
  paginatePins,
  parseMagazinePage,
} from "@/lib/content/magazine-feed";

type Params = { slug: string };
type Search = { page?: string };

async function loadCategory(slug: string) {
  try {
    const [categoriesPayload, articles] = await Promise.all([
      listCategories(),
      listArticles({ category: slug, page: 1, pageSize: 80 }),
    ]);
    return {
      categories: unwrapResults(categoriesPayload),
      articles: articles.results || [],
    };
  } catch {
    return { categories: [], articles: [] };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const board = boardBySlug(slug);
  if (board) {
    return {
      title: `${board.name} | مجله مرد کوهستان`,
      description: board.description,
    };
  }
  const { categories } = await loadCategory(slug);
  const category = categories.find((item) => item.slug === slug);
  if (!category) return { title: "دسته مجله | مرد کوهستان" };
  return {
    title: `${category.name} | مجله مرد کوهستان`,
    description: category.description || `نوشته‌های دسته ${category.name} در مجله مرد کوهستان.`,
  };
}

export default async function MagazineCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const payload = await loadCategory(slug);
  const board = boardBySlug(slug);
  const apiCategory = payload.categories.find((item) => item.slug === slug) || null;
  if (!board && !apiCategory) notFound();

  const pins = mergeCategoryPins(payload.articles, slug);
  const leaf = paginatePins(pins, parseMagazinePage(page));
  const name = board?.name || apiCategory?.name || "";
  const description = board?.description || apiCategory?.description || "";

  return (
    <div className="mk-mag-shell">
      <header className="mk-shelf-head">
        <p>قفسه مجله</p>
        <h2>{name}</h2>
        {description ? <span>{description}</span> : null}
      </header>
      <MagBoards boards={magazineBoards} active={slug} />
      {leaf.total ? (
        <>
          <MagMasonry pins={leaf.items} feed />
          <MagPager
            page={leaf.page}
            pageCount={leaf.pageCount}
            hrefFor={(nextPage) => magazineListHref({ page: nextPage, category: slug, hash: "#mk-feed" })}
          />
        </>
      ) : null}
    </div>
  );
}
