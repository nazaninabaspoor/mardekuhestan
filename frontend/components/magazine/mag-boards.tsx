import Image from "next/image";
import Link from "next/link";

import type { MagazineBoard } from "@/data/magazine-issue";
import { toneForCategory } from "@/lib/content/magazine-feed";

const ALL_IMAGE = "/magazine/png/png-way-green.png";

function Story({
  href,
  label,
  image,
  tone,
  active,
}: {
  href: string;
  label: string;
  image: string;
  tone: "forest" | "gold" | "earth" | "sage";
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mk-story mk-story--${tone}${active ? " is-active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span className="mk-story-ring">
        <span className="mk-story-avatar">
          <Image src={image} alt="" fill sizes="72px" />
        </span>
      </span>
      <em>{label}</em>
    </Link>
  );
}

export function MagBoards({ boards, active = "all" }: { boards: MagazineBoard[]; active?: string }) {
  return (
    <nav className="mk-ideas" aria-label="قفسه‌های مجله">
      <Story href="/magazine" label="همه نوشته‌ها" image={ALL_IMAGE} tone="forest" active={active === "all"} />
      {boards.map((board) => (
        <Story
          key={board.slug}
          href={`/magazine/category/${board.slug}`}
          label={board.name}
          image={board.image}
          tone={toneForCategory(board.slug)}
          active={active === board.slug}
        />
      ))}
    </nav>
  );
}
