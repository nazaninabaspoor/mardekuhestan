import type { Metadata } from "next";

import { MagBoards } from "@/components/magazine/mag-boards";
import { magazineBoards } from "@/data/magazine-issue";

export const metadata: Metadata = {
  title: "قفسه‌های مجله | مرد کوهستان",
  description: "دسته‌های تصویری مجله مرد کوهستان: راه ما، مسیر غذا، زندگی خانگی، مزرعه و مرتع.",
};

export default function MagazineCategoryIndexPage() {
  return (
    <div className="mk-mag-shell">
      <header className="mk-pin-head">
        <div>
          <p className="mk-mag-kicker">مجله مرد کوهستان</p>
          <h1>قفسه‌ها</h1>
          <p className="mk-pin-lead">هر قفسه یک مسیر است. تصویر را باز کنید، نوشته پشت آن است.</p>
        </div>
      </header>
      <MagBoards boards={magazineBoards} />
    </div>
  );
}
