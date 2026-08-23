import Link from "next/link";

import { latestArticles } from "@/lib/brand";

export default function MagazinePage() {
  return (
    <section className="inner">
      <div className="shell">
        <p className="inner-kicker">مجله</p>
        <h1>آخرین مقالات</h1>
        <p className="inner-lead">داستان مسیر غذا، خانه، و راه سبز.</p>
        <ul className="magazine-list">
          {latestArticles.map((article) => (
            <li key={article.id}>
              <Link href={`/magazine/${article.slug}`}>
                <span className="magazine-list-kicker">{article.category}</span>
                <strong>{article.title}</strong>
                <span className="magazine-list-meta">{article.date}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
jhbihgbgyh
