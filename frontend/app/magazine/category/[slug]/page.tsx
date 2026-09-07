import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MagBoards } from "@/components/magazine/mag-boards";
import { MagMasonry } from "@/components/magazine/mag-card";
import { boardBySlug, magazineBoards } from "@/data/magazine-issue";
import { listArticles, listCategories, unwrapResults } from "@/lib/api/content";
import { mergeCategoryPins } from "@/lib/content/magazine-feed";

type Params = { slug: string };
type Search = { page?: string };

async function loadCategory(slug: string, page: number) {
  try {
    const [categoriesPayload, articles] = await Promise.all([
      listCategories(),
      listArticles({ category: slug, page }),
    ]);
    return {
      categories: unwrapResults(categoriesPayload),
      articles: articles.results || [],
      count: articles.count || 0,
    };
  } catch {
    return { categories: [], articles: [], count: 0 };
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
  const { categories } = await loadCategory(slug, 1);
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
  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw || 1) || 1);
  const payload = await loadCategory(slug, page);
  const board = boardBySlug(slug);
  const apiCategory = payload.categories.find((item) => item.slug === slug) || null;
  if (!board && !apiCategory) notFound();

  const name = board?.name || apiCategory?.name || "";
  const description = board?.description || apiCategory?.description || "نوشته‌های این قفسه از راه سبز.";
  const pins = mergeCategoryPins(payload.articles, slug);
  const totalPages = Math.max(1, Math.ceil((payload.count || 0) / 12));

  return (
    <div className="mk-mag-shell">
      <header className="mk-pin-head">
        <div>
          <p className="mk-mag-kicker">مجله مرد کوهستان</p>
          <h1>{name}</h1>
          <p className="mk-pin-lead">{description}</p>
        </div>
      </header>

      <MagBoards boards={magazineBoards} />

      <nav className="mk-mag-rail" aria-label="دسته‌بندی مجله">
        <Link className="mk-mag-chip" href="/magazine">
          همه ایده‌ها
        </Link>
        {magazineBoards.map((item) => (
          <Link
            key={item.slug}
            className={`mk-mag-chip${item.slug === slug ? " is-active" : ""}`}
            href={`/magazine/category/${item.slug}`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {pins.length ? <MagMasonry pins={pins} /> : null}

      {payload.count > 12 && totalPages > 1 ? (
        <nav className="mk-mag-pager" aria-label="صفحه‌بندی دسته">
          {page > 1 ? (
            <Link href={page === 2 ? `/magazine/category/${slug}` : `/magazine/category/${slug}?page=${page - 1}`}>
              صفحه قبل
            </Link>
          ) : (
            <span />
          )}
          <span>
            {page} از {totalPages}
          </span>
          {page < totalPages ? <Link href={`/magazine/category/${slug}?page=${page + 1}`}>صفحه بعد</Link> : <span />}
        </nav>
      ) : null}
    </div>
  );
}
