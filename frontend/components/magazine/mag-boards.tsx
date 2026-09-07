import Image from "next/image";
import Link from "next/link";

import type { MagazineBoard } from "@/data/magazine-issue";

export function MagBoards({ boards }: { boards: MagazineBoard[] }) {
  return (
    <nav className="mk-boards" aria-label="قفسه‌های مجله">
      {boards.map((board) => (
        <Link key={board.slug} href={`/magazine/category/${board.slug}`} className="mk-board">
          <Image src={board.image} alt="" fill sizes="(max-width: 700px) 50vw, 25vw" />
          <span className="mk-board-veil" />
          <span className="mk-board-copy">
            <strong>{board.name}</strong>
            <em>{board.description}</em>
          </span>
        </Link>
      ))}
    </nav>
  );
}
