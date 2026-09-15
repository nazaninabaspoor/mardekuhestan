import Image from "next/image";
import Link from "next/link";

import type { CatalogProductCard } from "@/lib/catalog/map";

export function CatalogProductCard({ product }: { product: CatalogProductCard }) {
  return (
    <article className="product-card" id={product.id}>
      <Link
        href={product.href}
        className="product-card-photo"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={product.image}
          alt=""
          width={220}
          height={220}
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 40vw, 70vw"
          className="product-card-img"
        />
      </Link>
      <div className="product-card-body">
        <h3 className="product-card-name">
          <Link href={product.href}>{product.name}</Link>
        </h3>
        <p className="product-card-note">{product.note}</p>
        {product.weight ? (
          <p className="product-card-weight">{product.weight}</p>
        ) : null}
        {product.price ? (
          <p className="product-card-price">{product.price}</p>
        ) : null}
      </div>
      <Link href={product.href} className="product-card-cta">
        مشاهده
      </Link>
    </article>
  );
}
