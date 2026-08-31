import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductBySlug } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import { mapProductToCard, resolveMediaUrl } from "@/lib/catalog/map";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return {
      title: `${product.name} | مرد کوهستان`,
      description: product.short_description || product.subtitle,
    };
  } catch {
    return { title: "محصول | مرد کوهستان" };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const card = mapProductToCard(product);
  const gallery = product.images?.length
    ? product.images
    : product.hero_image
      ? [product.hero_image]
      : [];

  return (
    <section className="inner product-detail">
      <div className="shell">
        <nav className="product-detail-crumb" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/products">محصولات</Link>
          <span aria-hidden="true"> / </span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          <div className="product-detail-media">
            <Image
              src={card.image}
              alt={card.alt}
              width={640}
              height={640}
              priority
              className="product-detail-hero"
              sizes="(min-width: 900px) 480px, 90vw"
            />
            {gallery.length > 1 ? (
              <div className="product-detail-thumbs">
                {gallery.map((image) => {
                  const url = resolveMediaUrl(image.url);
                  if (!url) return null;
                  return (
                    <Image
                      key={image.public_uuid}
                      src={url}
                      alt={image.alt_text || product.name}
                      width={96}
                      height={96}
                      className="product-detail-thumb"
                    />
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="product-detail-copy">
            <p className="inner-kicker">{product.domain_label_fa}</p>
            <h1>{product.name}</h1>
            {product.subtitle ? (
              <p className="product-detail-subtitle">{product.subtitle}</p>
            ) : null}
            {product.short_description ? (
              <p className="inner-lead">{product.short_description}</p>
            ) : null}
            {card.price ? (
              <p className="product-detail-price">{card.price}</p>
            ) : null}
            {card.weight ? (
              <p className="product-detail-weight">{card.weight}</p>
            ) : null}

            {product.variants?.length ? (
              <div className="product-detail-variants">
                <h2>گزینه‌ها</h2>
                <ul>
                  {product.variants.map((variant) => (
                    <li key={variant.public_uuid}>
                      <strong>{variant.label}</strong>
                      {variant.unit_price_display ? (
                        <span> — {variant.unit_price_display}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Link href="/products" className="product-detail-back">
              بازگشت به فهرست
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
