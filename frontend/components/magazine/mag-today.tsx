import { MagBoards } from "@/components/magazine/mag-boards";
import { MagSearch } from "@/components/magazine/mag-search";
import type { MagazineBoard } from "@/data/magazine-issue";
import type { MagazinePageSettings } from "@/lib/api/content.types";
import { defaultMagazinePage } from "@/lib/content/magazine-page";

export function MagToday({
  query = "",
  boards,
  active = "all",
  page,
}: {
  query?: string;
  boards: MagazineBoard[];
  active?: string;
  page?: MagazinePageSettings;
}) {
  const settings = page || defaultMagazinePage;
  return (
    <section className="mk-issue">
      <div className="mk-issue-inner">
        <p>{settings.hero_eyebrow}</p>
        <h1>{settings.hero_title}</h1>
        <MagSearch query={query} placeholder={settings.search_placeholder} />
        <MagBoards boards={boards} active={active} />
      </div>
    </section>
  );
}
