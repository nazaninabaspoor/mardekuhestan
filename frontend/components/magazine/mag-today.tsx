import { MagBoards } from "@/components/magazine/mag-boards";
import { MagSearch } from "@/components/magazine/mag-search";
import type { MagazineBoard } from "@/data/magazine-issue";

export function MagToday({
  query = "",
  boards,
  active = "all",
}: {
  query?: string;
  boards: MagazineBoard[];
  active?: string;
}) {
  return (
    <section className="mk-issue">
      <div className="mk-issue-inner">
        <p>مجله مرد کوهستان</p>
        <h1>این راه سبز است</h1>
        <MagSearch query={query} />
        <MagBoards boards={boards} active={active} />
      </div>
    </section>
  );
}
