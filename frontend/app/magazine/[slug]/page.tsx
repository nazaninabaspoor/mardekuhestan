import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { latestArticles } from "@/lib/brand";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return latestArticles.map((article) => ({ slug: article.slug }));
}

export default async function MagazineArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = latestArticles.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="inner">
      <div className="shell magazine-article">
        <p className="inner-kicker">{article.category}</p>
        <h1>{article.title}</h1>
        <p className="inner-lead">{article.excerpt}</p>
        <p className="magazine-article-meta">{article.date}</p>
        <div className="magazine-article-cover">
          <Image
            src={article.image}
            alt={article.alt}
            width={960}
            height={540}
            sizes="(min-width: 900px) 960px, 100vw"
            style={{ objectFit: "contain" }}
          />
        </div>
        <p className="magazine-article-note">
          متن کامل این مقاله به‌زودی از طریق سامانه محتوا منتشر می‌شود.
        </p>
        <p>
          <Link href="/magazine">بازگشت به مجله</Link>
        </p>
      </div>
    </article>
  );
}
