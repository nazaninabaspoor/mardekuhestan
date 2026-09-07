import type { Metadata } from "next";

import { MagBoards } from "@/components/magazine/mag-boards";
import { MagMasonry } from "@/components/magazine/mag-card";
import { magazineBoards, magazinePins } from "@/data/magazine-issue";
import { issueToPin } from "@/lib/content/magazine-feed";

export const metadata: Metadata = {
  title: "قفسه‌های مجله | مرد کوهستان",
  description: "دسته‌های تصویری مجله مرد کوهستان: راه ما، مسیر غذا، زندگی خانگی، مزرعه و مرتع.",
};

export default function MagazineCategoryIndexPage() {
  return (
    <div className="mk-mag-shell">
      <header className="mk-shelf-head">
        <p>مجله مرد کوهستان</p>
        <h2>قفسه‌ها</h2>
        <span>هر قفسه یک موضوع است. یکی را باز کنید.</span>
      </header>
      <MagBoards boards={magazineBoards} active="all" />
      <MagMasonry pins={magazinePins.map(issueToPin)} />
    </div>
  );
}
