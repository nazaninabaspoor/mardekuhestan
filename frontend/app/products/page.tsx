import type { Metadata } from "next";
import Link from "next/link";

import type { CatalogDomain, CatalogProductListItem } from "@/lib/api/catalog.types";
import { CatalogProductCard } from "@/components/catalog-product-card";
import {
  listDomains,
  listProducts,
  resolveDomainFromCat,
} from "@/lib/api/catalog";
import { mapProductToCard } from "@/lib/catalog/map";
import { trustSignals } from "@/lib/brand";

export const metadata: Metadata = {
  title: "محصولات | مرد کوهستان",
  description:
    "گوشت تازه، لبنیات، ماهی و میگو، و غذای آماده — از مزرعه و مرتع تا سفرهٔ خانه.",
  alternates: { canonical: "/products" },
};

type Props = {
  searchParams: Promise<{ cat?: string; q?: string; domain?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { cat, q, domain: domainParam } = await searchParams;
  const query = q?.trim();

  let domains: CatalogDomain[] = [];
  let products: ReturnType<typeof mapProductToCard>[] = [];
  let apiError: string | null = null;

  try {
    domains = await listDomains();
    const activeDomain = domainParam
      ? domains.find((item) => item.key === domainParam)
      : resolveDomainFromCat(domains, cat);

    const response = await listProducts({
      domain: activeDomain?.key ?? domainParam,
      q: query,
      pageSize: 24,
    });
    products = response.results.map(mapProductToCard);
  } catch {
    apiError =
      "اتصال به API کاتالوگ برقرار نشد. سرور Django را روی پورت ۸۰۰۰ روشن کن.";
  }

  const activeDomain = domainParam
    ? domains.find((item) => item.key === domainParam)
    : resolveDomainFromCat(domains, cat);

  const pageTitle = query
    ? `جستجو: ${query}`
    : activeDomain?.label_fa ?? "محصولات";

  const pageLead = query
    ? products.length
      ? `${products.length} نتیجه از مسیر سبز`
      : "نتیجه‌ای پیدا نشد — عبارت دیگری امتحان کن."
    : activeDomain
      ? `محصولات ${activeDomain.label_fa} — از مزرعه و مرتع می‌آید.`
      : "گوشت، لبنیات، ماهی و غذای آماده. از مزرعه و مرتع می‌آید، با دقت آماده می‌شود.";

  return (
    <section className="inner">
      <div className="shell">
        <p className="inner-kicker">برای خانه</p>
        <h1>{pageTitle}</h1>
        <p className="inner-lead">{apiError ?? pageLead}</p>

        <form className="catalog-page-search" action="/products" role="search">
          <input
            type="search"
            name="q"
            defaultValue={query ?? ""}
            placeholder="جستجو در راه سبز — ماست، گوشت، لبنیات…"
            aria-label="جستجو در محصولات"
          />
          {activeDomain ? (
            <input type="hidden" name="cat" value={activeDomain.frontend_query_key} />
          ) : null}
          <button type="submit">جستجو</button>
        </form>

        <ul className="trust-strip" aria-label="مزیت‌های ما">
          {trustSignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>

        {domains.length ? (
          <div className="filter-chips" role="group" aria-label="فیلتر دامنه">
            <Link
              href={query ? `/products?q=${encodeURIComponent(query)}` : "/products"}
              className={`filter-chip${!activeDomain && !domainParam ? " is-active" : ""}`}
            >
              همه
            </Link>
            {domains.map((item) => {
              const href = query
                ? `/products?cat=${item.frontend_query_key}&q=${encodeURIComponent(query)}`
                : `/products?cat=${item.frontend_query_key}`;
              const active =
                activeDomain?.key === item.key ||
                cat === item.frontend_query_key;
              return (
                <Link
                  key={item.key}
                  href={href}
                  className={`filter-chip${active ? " is-active" : ""}`}
                >
                  {item.label_fa}
                </Link>
              );
            })}
          </div>
        ) : null}

        {products.length ? (
          <div className="product-grid">
            {products.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : !apiError ? (
          <p className="inner-lead">
            {query
              ? "محصولی با این عبارت پیدا نشد."
              : "در این دسته فعلاً محصول فعالی ثبت نشده — از Postman Admin یک محصول active بساز."}
          </p>
        ) : null}
      </div>
    </section>
  );
}
