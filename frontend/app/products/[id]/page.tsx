import React from "react";
import type { Metadata } from "next";
import { getProductDetail } from "@/lib/catalog/product-details";
import { ProductDetailView } from "@/components/product-detail/product-detail-view";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductDetail(id);
  return {
    title: `${product.name} | مرد کوهستان`,
    description: product.headline,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  const product = getProductDetail(id);

  return (
    <main className="product-page-main">
      <div className="shell">
        <ProductDetailView product={product} isModal={false} />
      </div>
    </main>
  );
}
