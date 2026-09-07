import Image from "next/image";
import Link from "next/link";

import type { MagazineBoard } from "@/data/magazine-issue";
import { toneForCategory } from "@/lib/content/magazine-feed";

export function MagBoards({ boards, active = "all" }: { boards: MagazineBoard[]; active?: string }) {
  return (
    <nav className="mk-ideas" aria-label="قفسه‌های مجله">
      <Link href="/magazine" className={`mk-idea mk-idea--forest${active === "all" ? " is-active" : ""}`}>
        همه نوشته‌ها
      </Link>
      {boards.map((board) => (
        <Link
          key={board.slug}
          href={`/magazine/category/${board.slug}`}
          className={`mk-idea mk-idea--${toneForCategory(board.slug)}${active === board.slug ? " is-active" : ""}`}
        >
          <span className="mk-idea-thumb">
            <Image src={board.image} alt="" fill sizes="48px" />
          </span>
          {board.name}
        </Link>
      ))}
    </nav>
  );
}
